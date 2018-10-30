import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, zip } from 'rxjs';
import { map, switchMap, shareReplay, tap, filter } from 'rxjs/operators';

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
  playerDraggable: Draggable;

  private draggingCreatureId$ = new BehaviorSubject<string>(null);
  private creatureDragMode$ = new BehaviorSubject<boolean>(false);
  private draggingCreatureCoordinates$ = new BehaviorSubject<[number, number]>(null);
  private itemCoordinates$ = new BehaviorSubject<ItemCoordinates[]>([]);
  private itemHoveredByCreature$ = new Observable<ItemCoordinates>(null);
  private itemHoveredByCreature: ItemCoordinates = null;

  private draggingPlayerId$ = new BehaviorSubject<string>(null);
  private draggingPlayerCoordinates$ = new BehaviorSubject<[number, number]>(null);

  constructor(
    private baseService: BaseService,
    private creatureService: CreatureService,
    private playerService: PlayerService
  ) {
    this.itemHoveredByCreature$ = this.bindItemHoveredByCreature().pipe(
      tap(hoveredItem => this.itemHoveredByCreature = hoveredItem),
      shareReplay(1),
    );

    this.bindPlayerMove().subscribe(({playerDragging, playerLeavingSpot}) => this.playerService.changePlayerOrder(playerDragging, playerLeavingSpot));
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

  private getCoordinatesFromOrderedList(itemCoordinates: ItemCoordinates[], idList: string[]): ItemCoordinates[] {
    const emptyItem = {
      itemId: null,
      x: null,
      y: null,
      width: null,
      height: null,
      type: null
    };

    return idList.map(entityId => {
      return itemCoordinates.find(item => item.itemId === entityId) || emptyItem;
    });
  }


  /* CREATURE DRAGGING */

  bindCreatureDragging(): Observable<boolean> {
    return this.creatureDragMode$.asObservable();
  }

  bindCreatureDraggingId(): Observable<string> {
    return this.draggingCreatureId$.asObservable();
  }

  bindIsHoveredByCreature(entityId: string): Observable<boolean> {
    return this.itemHoveredByCreature$.pipe(map(hoveringItemId => {
      return hoveringItemId && hoveringItemId.itemId === entityId;
    }));
  }

  creatureMouseDown(creatureId: string) {
    this.draggingCreatureId$.next(creatureId);
  }

  toggleCreatureDragMode(dragging: boolean) {
    this.creatureDragMode$.next(true);
    if (!dragging) {
      this.draggingCreatureId$.next(null);
      this.creatureDragMode$.next(false);
      this.draggingCreatureCoordinates$.next(null);
    }
  }

  setCreatureDraggingCoordinates(coordinates: [number, number]) {
    this.draggingCreatureCoordinates$.next(coordinates);
  }

  triggerCreatureDrop(creatureId: string) {
    if (this.itemHoveredByCreature && this.itemHoveredByCreature.type === BASE_TYPE) {
      this.baseService.moveCreatureToAnotherBase(creatureId, this.itemHoveredByCreature.itemId);
    }
    if (this.itemHoveredByCreature && this.itemHoveredByCreature.type === PLAYER_TYPE) {
      this.creatureService.edit(creatureId, (creature: Creature) => {
        creature.ownerId = this.itemHoveredByCreature.itemId;
        return creature;
      });
    }
    if (this.itemHoveredByCreature && this.itemHoveredByCreature.type === DELETE_BUTTON_TYPE) {
      this.creatureService.delete(creatureId, true);
    }
  }

  private bindItemHoveredByCreature(): Observable<ItemCoordinates> {
    return combineLatest(
      this.draggingCreatureId$,
      this.creatureDragMode$
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
          this.playerService.bindList()
        ).pipe(
          switchMap(([itemCoordinates, creature, bases, playersId]) => {
            const blackList = this.getBlackListedIdsForCreature(creature, bases);
            const entitiesCoordinates = this.getOrderedEntitiesCoordinates(
              itemCoordinates,
              playersId,
              bases.map(base => base.id)
            );
            return this.draggingCreatureCoordinates$.pipe(
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

  private getOrderedEntitiesCoordinates(itemCoordinates: ItemCoordinates[], playersId: string[], basesId: string[]): ItemCoordinates[] {
    return this.getCoordinatesFromOrderedList(
      itemCoordinates,
      [
        DELETE_BUTTON_ID,
        ...playersId,
        ...basesId
      ]
    );
  }

  private getBlackListedIdsForCreature(creature: Creature, bases: Base[]): string[] {
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


  /* PLAYER DRAGGING */

  bindPlayerDraggingCoordinates(): Observable<ItemCoordinates> {
    return combineLatest(
      this.itemCoordinates$,
      this.draggingPlayerId$
    ).pipe(
      map(([itemCoordinates, draggingPlayerId]) => itemCoordinates.find(coordinates => coordinates.itemId === draggingPlayerId))
    );
  }

  playerMouseDown(playerId: string) {
    this.draggingPlayerId$.next(playerId);
  }

  setPlayerDraggingCoordinates(coordinates: [number, number]) {
    this.draggingPlayerCoordinates$.next(coordinates);
  }

  triggerPlayerDrop() {
    this.draggingPlayerId$.next(null);
    this.draggingPlayerCoordinates$.next(null);
  }

  private bindPlayerMove(): Observable<any> {
    return this.draggingPlayerId$.pipe(
      switchMap(draggingPlayerId => {
        if (!draggingPlayerId) {
          return of(null);
        }
        return zip(
          this.itemCoordinates$,
          this.playerService.bindList()
        ).pipe(
          switchMap(([itemCoordinates, playersId]) => {
            const playerItemCoordinates = itemCoordinates.find(coord => coord.itemId === draggingPlayerId);
            if (!playerItemCoordinates) {
              return of(null);
            }
            const orderedPlayersCoordinates = this.getCoordinatesFromOrderedList(itemCoordinates, playersId);
            return this.draggingPlayerCoordinates$.pipe(
              map(draggingPlayerCoordinates => {
                playerItemCoordinates.x = draggingPlayerCoordinates[0];
                playerItemCoordinates.y = draggingPlayerCoordinates[1];

                // do magic
                return null;
              })
            );
          })
        );
      }),
      filter(res => !!res)
    );
  }
}
