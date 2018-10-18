import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { Draggable } from '@shared/utils/draggable';
import { Base } from '@shared/models/base';
import { position } from '@shared/utils/position';
import { CREATURE_CARD_SIZE, BASE_CARD_SIZE } from '@shared/constants';
import { BaseService } from './base.service';
import { CreatureService } from './creature.service';
import { PlayerService } from './player.service';

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

  bindIsHovered(entityId: string, type: 'base' | 'player'): Observable<boolean> {
    if (type === 'base') {
      return this.bindBaseListHovered().pipe(map(bases => {
        const selectedBase = bases.find(base => base.baseId === entityId);
        return selectedBase && selectedBase.hovered;
      }));
    }

    if (type === 'player') {

    }

    return of(false);
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
    this.bindBaseListHovered().pipe(first()).subscribe(hoveredBases => {
      const hoveredBase = hoveredBases.find(bases => bases.hovered);
      if (hoveredBase) {
        this.baseService.moveCreatureToAnotherBase(creatureId, hoveredBase.baseId);
      }
    });
  }

  private bindBaseListHovered(): Observable<{baseId: string, hovered: boolean}[]> {
    return combineLatest(
      this.bindCreatureDragging(),
      this.bindCreatureDraggingCoordinates(),
      this.baseService.bind()
    ).pipe(map(([draggingCreatureId, coordinates, bases]) => bases.map(base => ({
      baseId: base.id,
      hovered: this.isCreatureSuperposingBase(base.id, draggingCreatureId, coordinates, bases)
    }))));
  }

  private isCreatureSuperposingBase(baseId: string, creatureDraggingId: string, draggingCoordinates: number[], bases: Base[]): boolean {
    if (!creatureDraggingId || !draggingCoordinates) {
      return false;
    }
    const selectedBase = bases.find(base => base.id === baseId);
    if (!selectedBase || selectedBase.creatures.find(creatureId => creatureId === creatureDraggingId)) {
      return false;
    }
    return position.isSuperposingNoDuplicate(
      {itemId: creatureDraggingId, x: draggingCoordinates[0], y: draggingCoordinates[1], width: CREATURE_CARD_SIZE[0], height: CREATURE_CARD_SIZE[1]},
      selectedBase.id,
      bases.map(base => ({itemId: base.id, x: base.position.x, y: base.position.y, width: BASE_CARD_SIZE[0], height: BASE_CARD_SIZE[1]}))
    );
  }
}
