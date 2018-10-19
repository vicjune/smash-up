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

  private draggingCreatureId$ = new BehaviorSubject<string>(null);
  private draggingCoordinates$ = new BehaviorSubject<[number, number]>(null);
  private itemCoordinates$ = new BehaviorSubject<ItemCoordinates[]>([]);

  constructor(
    private baseService: BaseService,
    private creatureService: CreatureService,
    private playerService: PlayerService
  ) {}

  bindCreatureDragging(): Observable<string> {
    return this.draggingCreatureId$.asObservable();
  }

  bindIsHovered(entityId: string): Observable<boolean> {
    return this.bindEntitiesHovered().pipe(map(entities => {
      const selectedEntity = entities.find(entity => entity.itemId === entityId);
      return selectedEntity ? selectedEntity.hovered : false;
    }));
  }

  bindCreatureDraggingCoordinates(): Observable<[number, number]> {
    return this.draggingCoordinates$.asObservable();
  }

  registerCoordinates(coordinates: ItemCoordinates) {
    const itemsCoordinates = this.itemCoordinates$.getValue();
    const index = itemsCoordinates.findIndex(itemCoordinates => itemCoordinates.itemId === coordinates.itemId);
    if (index !== -1) {
      itemsCoordinates[index] = coordinates;
    } else {
      itemsCoordinates.push(coordinates);
    }
    this.itemCoordinates$.next(itemsCoordinates);
  }

  unregisterCoordinates(itemId: string) {
    const itemsCoordinates = this.itemCoordinates$.getValue();
    const index = itemsCoordinates.findIndex(coordinates => coordinates.itemId === itemId);
    itemsCoordinates.splice(index, 1);
    this.itemCoordinates$.next(itemsCoordinates);
  }

  toggleCreatureDragMode(creatureId: string, dragging: boolean) {
    this.draggingCreatureId$.next(dragging ? creatureId : null);
    if (!dragging) {
      this.draggingCoordinates$.next(null);
    }
  }

  setCreatureDraggingCoordinates(coordinates: [number, number]) {
    this.draggingCoordinates$.next(coordinates);
  }

  triggerCreatureDrop(creatureId: string) {
    this.bindEntitiesHovered().pipe(first()).subscribe(entities => {
      const hoveredEntity = entities.find(entity => entity.hovered);
      if (hoveredEntity && hoveredEntity.type === 'base') {
        this.baseService.moveCreatureToAnotherBase(creatureId, hoveredEntity.itemId);
      }
      if (hoveredEntity && hoveredEntity.type === 'player') {
        this.creatureService.editById(creatureId, (creature: Creature) => {
          creature.ownerId = hoveredEntity.itemId;
          return creature;
        });
      }
      if (hoveredEntity && hoveredEntity.type === 'delete_button') {
        this.creatureService.delete(creatureId);
      }
    });
  }

  bindEntitiesHovered(): Observable<ItemCoordinates[]> {
    return combineLatest(
      this.draggingCreatureId$,
      this.draggingCoordinates$,
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
      this.itemCoordinates$,
      this.playerService.bind(),
      this.baseService.bind(),
    ).pipe(map(([itemCoordinates, players, bases]) => {
      const emptyItem = {
        itemId: null,
        x: null,
        y: null,
        width: null,
        height: null,
        type: null
      };

      return [
        { id: 'delete_button' },
        ...players,
        ...bases
      ].map(entity => {
        return itemCoordinates.find(item => item.itemId === entity.id) || emptyItem;
      });
    }));
  }

  private isCreatureSuperposingEntity(
    entityId: string,
    creatureDraggingId: string,
    draggingCoordinates: [number, number],
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

    if (!selectedBase) {
      const selectedPlayer = players.find(player => player.id === entityId);

      const draggingCreature = creatures.find(creature => creature.id === creatureDraggingId);
      if (selectedPlayer && draggingCreature && draggingCreature.ownerId === selectedPlayer.id) {
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
        type: null
      },
      entityId,
      entitiesCoordinates
    );
  }
}
