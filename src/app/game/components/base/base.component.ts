import { Component, OnInit, Input, forwardRef, EventEmitter, Output } from '@angular/core';
import {FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { Base } from '@shared/models/base';
import { BASE_REWARD_LIMITS, MAX_CARD_ROTATION_DEG, BASE_MAX_RESISTANCE, AVAILABLE_COLORS } from '@shared/constants';
import { BaseService } from '@shared/services/base.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseComponent), multi: true},
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => BaseComponent), multi: true}
  ]
})
export class BaseComponent implements OnInit, ControlValueAccessor {
  @Input() newBase: boolean;
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() conquer: EventEmitter<void> = new EventEmitter<void>();

  editMode = false;
  detailsMode = false;

  BASE_REWARD_LIMITS = BASE_REWARD_LIMITS;
  BASE_MAX_RESISTANCE = BASE_MAX_RESISTANCE;

  private _base: Base;
  get base() {
    return this._base;
  }
  set base(val) {
    this._base = val;
    this.propagateChange(val);
  }

  propagateChange: Function = () => {};

  constructor(
    public baseService: BaseService
  ) { }

  ngOnInit() {
    if (this.newBase) {
      this.editMode = true;
      this.detailsMode = true;
    }
  }

  bindAvailableColors(): Observable<number[]> {
    return this.baseService.bindAvailableColors(AVAILABLE_COLORS);
  }

  increaseReward(index) {
    if (this.base.rewards[index] < BASE_REWARD_LIMITS[1]) {
      const base = this.base;
      base.rewards[index] ++;
      this.base = base;
    }
  }

  decreaseReward(index) {
    if (this.base.rewards[index] > BASE_REWARD_LIMITS[0]) {
      const base = this.base;
      base.rewards[index] --;
      this.base = base;
    }
  }

  increaseResistance() {
    if (this.base.maxResistance < BASE_MAX_RESISTANCE) {
      const base = this.base;
      base.maxResistance ++;
      this.base = base;
    }
  }

  decreaseResistance() {
    if (this.base.maxResistance > 0) {
      const base = this.base;
      base.maxResistance --;
      this.base = base;
    }
  }

  chooseColor(color: number) {
    const base = this.base;
    base.color = color;
    this.base = base;
  }

  getTransform(): string {
    if (this.editMode || this.detailsMode) {
      if (this.detailsMode) {
        return 'translate(-50%, -50%) rotate(0) scale(1.5)';
      }
      return 'translate(0, 0) rotate(0) scale(1)';
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
  }

  deleteBase() {
    this.delete.emit();
  }

  conquerBase() {
    this.conquer.emit();
  }

  writeValue(value) {
    if (value) {
      this.base = value;
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}


  validate(c: FormControl) {
    return null;
  }

}
