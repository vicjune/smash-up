import { Component, OnInit, Input, forwardRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { Observable } from 'rxjs';

import { Base } from '@shared/models/base';
import { BASE_REWARD_LIMITS, MAX_CARD_ROTATION_DEG, BASE_MAX_RESISTANCE, AVAILABLE_COLORS } from '@shared/constants';
import { BaseService } from '@shared/services/base.service';
import { PlayerService } from '@shared/services/player.service';
import { Draggable } from '@shared/utils/draggable';
import { Creature } from '@shared/models/creature';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => BaseComponent), multi: true }
  ]
})
export class BaseComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Input() newBase: boolean;
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() conquer: EventEmitter<void> = new EventEmitter<void>();

  detailModeCreatureId: string = null;

  editMode = false;
  detailsMode = false;

  creatureList$: Observable<string[][]>;
  players$ = this.playerService.bind();

  draggable = new Draggable();

  BASE_REWARD_LIMITS = BASE_REWARD_LIMITS;
  BASE_MAX_RESISTANCE = BASE_MAX_RESISTANCE;

  portraitMode = false;
  boundCheckOrientation = this.checkOrientation.bind(this);

  private _base: Base;
  get base() {
    return this._base;
  }
  set base(val) {
    this._base = val;
    this.propagateChange(val);
    this.creatureList$ = this.baseService.getCreatureOrderedList(val.id);
  }

  propagateChange: Function = () => { };

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService
  ) {}

  ngOnInit() {
    if (this.newBase) {
      this.editMode = true;
      this.detailsMode = true;
    }

    this.draggable.clickEvent.subscribe(() => this.seeMoreDetails());
    this.draggable.dropEvent.subscribe(([x, y]) => {
      const base = this.base;
      base.position.x = x;
      base.position.y = y;
      this.base = base;
    });

    this.checkOrientation();
    window.addEventListener('orientationchange', this.boundCheckOrientation, false);
    window.addEventListener('resize', this.boundCheckOrientation, false);
  }

  bindAvailableColors(): Observable<number[]> {
    return this.baseService.bindAvailableColors(AVAILABLE_COLORS);
  }

  increaseReward(index: number) {
    if (this.base.rewards[index] < BASE_REWARD_LIMITS[1]) {
      const base = this.base;
      base.rewards[index]++;
      this.base = base;
    }
  }

  decreaseReward(index: number) {
    if (this.base.rewards[index] > BASE_REWARD_LIMITS[0]) {
      const base = this.base;
      base.rewards[index]--;
      this.base = base;
    }
  }

  increaseResistance() {
    if (this.base.maxResistance < BASE_MAX_RESISTANCE) {
      const base = this.base;
      base.maxResistance++;
      this.base = base;
    }
  }

  decreaseResistance() {
    if (this.base.maxResistance > 0) {
      const base = this.base;
      base.maxResistance--;
      this.base = base;
    }
  }

  chooseColor(color: number) {
    const base = this.base;
    base.color = color;
    this.base = base;
  }

  getTransform(): string {
    if (this.detailsMode) {
      if (this.editMode) {
        return 'translate(-50%, -50%) rotate(0) scale(1.5)';
      }
      if (this.portraitMode) {
        return 'translate(-50%, 0) rotate(0) scale(1.5)';
      }
      return 'translate(0, -50%) rotate(0) scale(1.5)';
    }
    return 'translate(0, 0) rotate(' + (Math.floor(
      this.base.position.rotation * (MAX_CARD_ROTATION_DEG + MAX_CARD_ROTATION_DEG + 1)
    ) - MAX_CARD_ROTATION_DEG) + 'deg) scale(1)';
  }

  seeMoreDetails() {
    if (!this.detailsMode && !this.editMode) {
      this.detailsMode = true;
    }
  }

  exitMoreDetails() {
    this.detailsMode = false;
    this.editMode = false;
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
    this.baseService.createCreature(newCreature, this.base.id);

    if (!strength) {
      this.detailModeCreatureId = newCreature.id;
    }
  }

  toggleCreatureDetailMode(creatureId: string) {
    this.detailModeCreatureId = this.detailModeCreatureId === creatureId ? null : creatureId;
  }

  mouseDown(e: TouchEvent) {
    if (!this.detailsMode) {
      this.draggable.mouseDown(e);
    }
  }

  mouseMove(e: TouchEvent) {
    if (!this.detailsMode) {
      this.draggable.mouseMove(e);
    }
  }

  mouseUp() {
    this.draggable.mouseUp();
  }

  checkOrientation() {
    this.portraitMode = window.innerHeight > window.innerWidth;
  }









  writeValue(value) {
    if (value) {
      this.base = value;
      this.draggable.coordinates = [this.base.position.x, this.base.position.y];
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() { }

  validate(c: FormControl) {
    return null;
  }

  ngOnDestroy() {
    window.removeEventListener('orientationchange', this.boundCheckOrientation, false);
    window.removeEventListener('resize', this.boundCheckOrientation, false);
  }
}
