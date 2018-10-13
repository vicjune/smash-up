import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Base } from '@shared/models/base';
import { BASE_REWARD_LIMITS, MAX_CARD_ROTATION_DEG, BASE_MAX_RESISTANCE, AVAILABLE_COLORS } from '@shared/constants';
import { BaseService } from '@shared/services/base.service';
import { PlayerService } from '@shared/services/player.service';
import { Draggable } from '@shared/utils/draggable';
import { Creature } from '@shared/models/creature';
import { windowEvents } from '@shared/utils/windowEvents';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent implements OnInit, OnDestroy {
  @Input() baseId: string;
  @Input() newBase: boolean;
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() conquer: EventEmitter<void> = new EventEmitter<void>();

  detailModeCreatureId: string = null;

  base$: Observable<Base>;
  creatureList$: Observable<string[][]>;
  players$ = this.playerService.bind();
  editMode$ = new BehaviorSubject<boolean>(false);
  detailsMode$ = new BehaviorSubject<boolean>(false);
  transform$: Observable<string>;
  transform: string;

  draggable = new Draggable();

  BASE_REWARD_LIMITS = BASE_REWARD_LIMITS;
  BASE_MAX_RESISTANCE = BASE_MAX_RESISTANCE;

  subscription = new Subscription();

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService,
    public changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.base$ = this.baseService.bindFromId(this.baseId).pipe(
      map(base => base as Base),
      tap(base => {
        if (base) {
          this.draggable.coordinates = [base.position.x, base.position.y];
        }
      })
    );
    this.creatureList$ = this.baseService.getCreatureOrderedList(this.baseId);
    this.transform$ = combineLatest(
      this.base$,
      windowEvents.portrait,
      this.editMode$,
      this.detailsMode$
    ).pipe(map(this.getTransform));

    if (this.newBase) {
      this.editMode$.next(true);
      this.detailsMode$.next(true);
    }

    this.subscription.add(this.draggable.clickEvent.subscribe(() => this.seeMoreDetails()));
    this.subscription.add(this.draggable.dropEvent.subscribe(([x, y]) => {
      this.baseService.editById(this.baseId, (base: Base) => {
        if (base) {
          base.position.x = x;
          base.position.y = y;
        }
        return base;
      });
    }));

    // Workaround angular change detect bug
    this.subscription.add(this.transform$.subscribe(transform => {
      this.transform = transform;
      this.changeDetectorRef.detectChanges();
    }));
  }

  bindAvailableColors(): Observable<number[]> {
    return this.baseService.bindAvailableColors(AVAILABLE_COLORS);
  }

  increaseReward(index: number) {
    this.baseService.editById(this.baseId, (base: Base) => {
      if (base.rewards[index] < BASE_REWARD_LIMITS[1]) {
        base.rewards[index] ++;
      }
      return base;
    });
  }

  decreaseReward(index: number) {
    this.baseService.editById(this.baseId, (base: Base) => {
      if (base.rewards[index] > BASE_REWARD_LIMITS[0]) {
        base.rewards[index] --;
      }
      return base;
    });
  }

  increaseResistance() {
    this.baseService.editById(this.baseId, (base: Base) => {
      if (base.maxResistance < BASE_MAX_RESISTANCE) {
        base.maxResistance ++;
      }
      return base;
    });
  }

  decreaseResistance() {
    this.baseService.editById(this.baseId, (base: Base) => {
      if (base.maxResistance > 0) {
        base.maxResistance --;
      }
      return base;
    });
  }

  chooseColor(color: number) {
    this.baseService.editById(this.baseId, (base: Base) => {
      base.color = color;
      return base;
    });
  }

  toggleEditMode() {
    this.editMode$.next(!this.editMode$.getValue());
  }

  seeMoreDetails() {
    if (!this.detailsMode$.getValue() && !this.editMode$.getValue()) {
      this.detailsMode$.next(true);
    }
  }

  exitMoreDetails() {
    this.detailsMode$.next(false);
    this.editMode$.next(false);
    this.detailModeCreatureId = null;
  }

  deleteBase() {
    this.delete.emit();
  }

  conquerBase() {
    this.conquer.emit();
  }

  createCreature(ownerId: string, strength?: number) {
    const newCreature = new Creature(ownerId, strength);
    this.baseService.createCreature(newCreature, this.baseId);

    if (!strength) {
      this.detailModeCreatureId = newCreature.id;
    }
  }

  toggleCreatureDetailMode(creatureId: string) {
    this.detailModeCreatureId = this.detailModeCreatureId === creatureId ? null : creatureId;
  }

  exitCreatureDetailMode() {
    this.detailModeCreatureId = null;
  }

  mouseDown(e: TouchEvent) {
    if (!this.detailsMode$.getValue()) {
      this.draggable.mouseDown(e);
    }
  }

  mouseMove(e: TouchEvent) {
    if (!this.detailsMode$.getValue()) {
      this.draggable.mouseMove(e);
    }
  }

  mouseUp() {
    this.draggable.mouseUp();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getTransform([base, portrait, editMode, detailsMode]): string {
    if (detailsMode) {
      if (editMode || (base && base.creatures.length === 0)) {
        return 'translate(-50%, -50%) rotate(0) scale(1.5)';
      }
      if (portrait) {
        return 'translate(-50%, 0) rotate(0) scale(1.5)';
      }
      return 'translate(0, -50%) rotate(0) scale(1.5)';
    }
    return 'translate(0, 0) rotate(' + (base ? (Math.floor(
      base.position.rotation * (MAX_CARD_ROTATION_DEG + MAX_CARD_ROTATION_DEG + 1)
    ) - MAX_CARD_ROTATION_DEG) : 0) + 'deg) scale(1)';
  }
}
