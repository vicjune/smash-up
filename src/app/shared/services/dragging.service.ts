import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Draggable } from '@shared/utils/draggable';
import { Base } from '@shared/models/base';
import { position } from '@shared/utils/position';
import { CREATURE_CARD_SIZE, DELETE_BUTTON_ID, DELETE_BUTTON_TYPE, BASE_TYPE, PLAYER_TYPE } from '@shared/constants';
import { BaseService } from './base.service';
import { CreatureService } from './creature.service';
import { PlayerService } from './player.service';
import { ItemCoordinates } from '@shared/interfaces/itemCoordinates';
import { Creature } from '@shared/models/creature';

@Injectable()
export class DraggingService {
  creatureDraggable: Draggable;

  private draggingCreatureId$ = new BehaviorSubject<string>(null);
  private dragMode$ = new BehaviorSubject<boolean>(false);
  private draggingCoordinates$ = new BehaviorSubject<[number, number]>(null);
  private itemCoordinates$ = new BehaviorSubject<ItemCoordinates[]>([]);
  private hoveringItem$ = new BehaviorSubject<ItemCoordinates>(null);

  constructor(
    private baseService: BaseService,
    private creatureService: CreatureService,
    private playerService: PlayerService
  ) {
    this.bindItemHovered().subscribe(itemHovered => this.hoveringItem$.next(itemHovered));
  }

  bindCreatureDragging(): Observable<boolean> {
    return this.dragMode$.asObservable();
  }

  bindCreatureDraggingId(): Observable<string> {
    return this.draggingCreatureId$.asObservable();
  }

  bindIsHovered(entityId: string): Observable<boolean> {
    return this.hoveringItem$.pipe(map(hoveringItemId => {
      return hoveringItemId && hoveringItemId.itemId === entityId;
    }));
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

  creatureMouseDown(creatureId: string) {
    this.draggingCreatureId$.next(creatureId);
  }

  toggleCreatureDragMode(dragging: boolean) {
    this.dragMode$.next(true);
    if (!dragging) {
      this.draggingCreatureId$.next(null);
      this.dragMode$.next(false);
      this.draggingCoordinates$.next(null);
    }
  }

  setCreatureDraggingCoordinates(coordinates: [number, number]) {
    this.draggingCoordinates$.next(coordinates);
  }

  triggerCreatureDrop(creatureId: string) {
    const hoveredEntity = this.hoveringItem$.getValue();
    if (hoveredEntity && hoveredEntity.type === BASE_TYPE) {
      this.baseService.moveCreatureToAnotherBase(creatureId, hoveredEntity.itemId);
    }
    if (hoveredEntity && hoveredEntity.type === PLAYER_TYPE) {
      this.creatureService.edit(creatureId, (creature: Creature) => {
        creature.ownerId = hoveredEntity.itemId;
        return creature;
      });
    }
    if (hoveredEntity && hoveredEntity.type === DELETE_BUTTON_TYPE) {
      this.creatureService.delete(creatureId);
    }
  }

  private bindItemHovered(): Observable<ItemCoordinates> {
    return combineLatest(
      this.draggingCreatureId$,
      this.dragMode$
    ).pipe(
      switchMap(([draggingCreatureId, dragMode]) => {
        if (!draggingCreatureId || !dragMode) {
          return of(null);
        }
        const creatureItemCoordinates = {
          itemId: draggingCreatureId,
          x: null,
          y: null,
          width: position.pxToPercent(CREATURE_CARD_SIZE[0], 'x'),
          height: position.pxToPercent(CREATURE_CARD_SIZE[1], 'y'),
          type: null
        };
        return combineLatest(
          this.itemCoordinates$,
          this.creatureService.bindFromId(draggingCreatureId),
          this.baseService.bindAllEntities(),
          this.playerService.bindAllEntities()
        ).pipe(
          switchMap(([itemCoordinates, creature, bases, players]) => {
            const blackList = this.getBlackListedIds(creature, bases);
            const entitiesCoordinates = this.getEntitiesCoordinates(
              itemCoordinates,
              players.map(player => player.id),
              bases.map(base => base.id)
            );
            return this.draggingCoordinates$.pipe(
              map(creatureCoordinates => {
                if (!creatureCoordinates) {
                  return null;
                }
                creatureItemCoordinates.x = creatureCoordinates[0];
                creatureItemCoordinates.y = creatureCoordinates[1];
                return position.getSuperposingId(
                  creatureItemCoordinates,
                  entitiesCoordinates,
                  blackList
                );
              })
            );
          })
        );
      })
    );
  }

  private getEntitiesCoordinates(itemCoordinates: ItemCoordinates[], playersId: string[], basesId: string[]): ItemCoordinates[] {
    const emptyItem = {
      itemId: null,
      x: null,
      y: null,
      width: null,
      height: null,
      type: null
    };

    return [
      DELETE_BUTTON_ID,
      ...playersId,
      ...basesId
    ].map(entityId => {
      return itemCoordinates.find(item => item.itemId === entityId) || emptyItem;
    });
  }

  private getBlackListedIds(creature: Creature, bases: Base[]): string[] {
    if (!creature) {
      return [];
    }
    const baseOnWhichTheCreatureIs = bases.find(base => !!base.creatures.find(creatureOnBaseId => creatureOnBaseId === creature.id));
    const result = [];
    if (baseOnWhichTheCreatureIs) {
      result.push(baseOnWhichTheCreatureIs.id);
    }
    if (creature) {
      result.push(creature.ownerId);
    }
    return result;
  }
}
