import { Component, OnInit, Input, forwardRef } from '@angular/core';
import {FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';

import { Base } from '@shared/models/base';
import { BASE_REWARD_LIMITS } from '@shared/constants';

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
  @Input() editMode = false;

  BASE_REWARD_LIMITS = BASE_REWARD_LIMITS;

  private _base: Base;
  get base() {
    return this._base;
  }
  set base(val) {
    this._base = val;
    this.propagateChange(val);
  }

  propagateChange: Function = () => {};

  constructor() { }

  ngOnInit() {
  }

  increaseReward(index) {
    if (this.base.rewards[index] < BASE_REWARD_LIMITS[1]) {
      this.base.rewards[index] ++;
    }
  }

  decreaseReward(index) {
    if (this.base.rewards[index] > BASE_REWARD_LIMITS[0]) {
      this.base.rewards[index] --;
    }
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
