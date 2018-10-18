import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { Draggable } from '@shared/utils/draggable';
import { Base } from '@shared/models/base';
import { position } from '@shared/utils/position';
import { CREATURE_CARD_SIZE, BASE_CARD_SIZE, PLAYER_LIST_PADDING, PLAYER_CARD_MAX_SIZE, PLAYER_CARD_MARGIN_BOTTOM } from '@shared/constants';
import { BaseService } from './base.service';
import { CreatureService } from './creature.service';
import { PlayerService } from './player.service';
import { ItemCoordinates } from '@shared/interfaces/itemCoordinates';
import { windowEvents } from '@shared/utils/windowEvents';
import { Player } from '@shared/models/player';
import { Creature } from '@shared/models/creature';

@Injectable()
export class DraggingService {
  creatureDraggable: Draggable;

  private dragging$ = new BehaviorSubject<string>(null);
  private draggingCoordinates$ = new BehaviorSubject<number[]>(null);

  constructor(
    private baseService: BaseService,
    private creatureService: CreatureService,
    private playerService: PlayerService
  ) { }

  bindCreatureDragging(): Observable<string> {
    return this.dragging$.asObservable();
  }

  bindIsHovered(entityId: string): Observable<boolean> {
    return this.bindEntitiesHovered().pipe(map(entities => {
      const selectedEntity = entities.find(entity => entity.itemId === entityId);
      return selectedEntity && selectedEntity.hovered;
    }));
  }

  bindCreatureDraggingCoordinates(): Observable<number[]> {
    return this.draggingCoordinates$.asObservable();
  }

  toggleCreatureDragMode(creatureId: string, dragging: boolean) {
    this.dragging$.next(dragging ? creatureId : null);
    if (!dragging) {
      this.draggingCoordinates$.next(null);
    }
  }

  setCreatureDraggingCoordinates(coordinates: number[]) {
    this.draggingCoordinates$.next(coordinates);
  }

  triggerCreatureDrop(creatureId: string) {
    this.bindEntitiesHovered().pipe(first()).subscribe(entities => {
      const hoveredEntity = entities.find(entity => entity.hovered);
      if (hoveredEntity && hoveredEntity.type === 'base') {
        this.baseService.moveCreatureToAnotherBase(creatureId, hoveredEntity.itemId);
      }
    });
  }

  private bindEntitiesHovered(): Observable<ItemCoordinates[]> {
    return combineLatest(
      this.bindCreatureDragging(),
      this.bindCreatureDraggingCoordinates(),
      this.bindEntitiesCoordinates(),
      this.baseService.bind(),
      this.playerService.bind(),
      this.creatureService.bind()
    ).pipe(map(([draggingCreatureId, coordinates, entitiesCoordinates, bases, players, creatures]) => entitiesCoordinates.map(entityCoordinates => ({
      ...entityCoordinates,
      hovered: this.isCreatureSuperposingEntity(
        entityCoordinates.itemId,
        draggingCreatureId,
        coordinates,
        entitiesCoordinates,
        bases,
        players,
        creatures
      )
    }))));
  }

  private bindEntitiesCoordinates(): Observable<ItemCoordinates[]> {
    return combineLatest(
      windowEvents.windowSize,
      this.playerService.bind(),
      this.baseService.bind(),
    ).pipe(map(([windowSize, players, bases]) => {
      const playerCoordinates = players.map((player, index, array) => {
        const playerCardMaxHeight = index * (PLAYER_CARD_MAX_SIZE[1] + PLAYER_CARD_MARGIN_BOTTOM);
        const playerY = position.pxToPercent(PLAYER_LIST_PADDING[1] + index * playerCardMaxHeight, 'y');
        return {
          itemId: player.id,
          x: position.pxToPercent(PLAYER_LIST_PADDING[0], 'x'),
          y: playerY,
          width: PLAYER_CARD_MAX_SIZE[0],
          height: PLAYER_CARD_MAX_SIZE[1],
          type: 'player'
        };
      });

      const basesCoordinates = bases.map(base => {
        return {
          itemId: base.id,
          x: base.position.x,
          y: base.position.y,
          width: BASE_CARD_SIZE[0],
          height: BASE_CARD_SIZE[1],
          type: 'base'
        };
      });

      return [...playerCoordinates, ...basesCoordinates];
    }));
  }

  private isCreatureSuperposingEntity(
    entityId: string,
    creatureDraggingId: string,
    draggingCoordinates: number[],
    entitiesCoordinates: ItemCoordinates[],
    bases: Base[],
    players: Player[],
    creatures: Creature[]
  ): boolean {
    if (!creatureDraggingId || !draggingCoordinates) {
      return false;
    }

    const selectedBase = bases.find(base => base.id === entityId);
    if (selectedBase && selectedBase.creatures.find(creatureId => creatureId === creatureDraggingId)) {
      return false;
    }

    let selectedPlayer;
    if (!selectedBase) {
      selectedPlayer = players.find(player => player.id === entityId);
      if (!selectedPlayer) {
        return false;
      }

      const draggingCreature = creatures.find(creature => creature.id === creatureDraggingId);
      if (!draggingCreature || draggingCreature.ownerId === selectedPlayer.id) {
        return false;
      }
    }

    return position.isSuperposingNoDuplicate(
      {
        itemId: creatureDraggingId,
        x: draggingCoordinates[0],
        y: draggingCoordinates[1],
        width: CREATURE_CARD_SIZE[0],
        height: CREATURE_CARD_SIZE[1],
        type: selectedBase ? 'base' : 'player'
      },
      selectedBase ? selectedBase.id : selectedPlayer.id,
      entitiesCoordinates
    );
  }
}
