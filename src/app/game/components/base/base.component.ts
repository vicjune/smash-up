import { Component, OnInit, Input, forwardRef, EventEmitter, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { Score } from '@shared/models/base';
import { Base } from '@shared/models/base';
import { BASE_REWARD_LIMITS, MAX_CARD_ROTATION_DEG, BASE_MAX_RESISTANCE, AVAILABLE_COLORS } from '@shared/constants';
import { BaseService } from '@shared/services/base.service';
import { PlayerService } from '@shared/services/player.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BaseComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => BaseComponent), multi: true }
  ]
})
export class BaseComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() newBase: boolean;
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() conquer: EventEmitter<void> = new EventEmitter<void>();

  editMode = false;
  detailsMode = false;
  openedModifiers: boolean[] = [];
  openedModifierTimeout: any[] = [];
  dragging = false;
  draggingStart = false;
  draggingStartTimeout;

  coordinates: number[] = [0, 0];
  mouseOffset: number[] = [0, 0];

  BASE_REWARD_LIMITS = BASE_REWARD_LIMITS;
  BASE_MAX_RESISTANCE = BASE_MAX_RESISTANCE;

  @ViewChild('baseRef') baseRef: ElementRef;

  private _base: Base;
  get base() {
    return this._base;
  }
  set base(val) {
    this._base = val;
    this.propagateChange(val);
  }

  propagateChange: Function = () => { };

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService
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

  increaseScore(scoreIndex: number) {
    const base = this.base;
    base.scores[scoreIndex].score++;
    this.base = base;
  }

  decreaseScore(scoreIndex: number) {
    if (this.base.scores[scoreIndex].score > 0) {
      const base = this.base;
      base.scores[scoreIndex].score--;
      this.base = base;
    }
  }

  increaseScoreModifier(scoreIndex: number) {
    const base = this.base;
    base.scores[scoreIndex].scoreModifier++;
    this.base = base;
  }

  decreaseScoreModifier(scoreIndex: number) {
    const base = this.base;
    base.scores[scoreIndex].scoreModifier--;
    this.base = base;
  }

  addScore(playerId: string) {
    const base = this.base;
    base.scores.push(new Score(playerId));
    this.openedModifiers.push(false);
    this.base = base;
  }

  deleteScore(scoreIndex: number) {
    const base = this.base;
    base.scores.splice(scoreIndex, 1);
    this.base = base;
    this.openedModifiers.splice(scoreIndex, 1);
  }

  openModifierClick(scoreIndex: number) {
    if (this.openedModifiers[scoreIndex] && this.base.scores[scoreIndex].scoreModifier === 0) {
      this.openedModifiers[scoreIndex] = false;
    } else {
      this.openedModifiers[scoreIndex] = true;
    }

    if (this.openedModifierTimeout[scoreIndex]) {
      clearTimeout(this.openedModifierTimeout[scoreIndex]);
    }
    this.openedModifierTimeout[scoreIndex] = setTimeout(() => {
      if (this.base.scores[scoreIndex].scoreModifier === 0) {
        this.openedModifiers[scoreIndex] = false;
      }
    }, 3000);
  }

  modifierLeave(scoreIndex: number) {
    this.openedModifierTimeout[scoreIndex] = setTimeout(() => {
      if (this.base.scores[scoreIndex].scoreModifier === 0) {
        this.openedModifiers[scoreIndex] = false;
      }
    }, 3000);
  }

  modifierEnter(scoreIndex: number) {
    if (this.openedModifierTimeout[scoreIndex]) {
      clearTimeout(this.openedModifierTimeout[scoreIndex]);
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


  getScore(playerId: string): { score: Score, index: number } {
    const index = this.base.scores.map(score => score.playerId).indexOf(playerId);
    if (index !== -1) {
      return { score: this.base.scores[index], index: index };
    }
    return { score: null, index: -1 };
  }

  seeMoreDetails() {
    if (!this.detailsMode && !this.editMode && !this.dragging) {
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

      this.base.scores.forEach((score, index) => {
        this.openedModifiers[index] = false;
        if (score.scoreModifier !== 0) {
          this.openedModifiers[index] = true;
        }
      });

      this.coordinates = [this.base.position.x, this.base.position.y];
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() { }


  validate(c: FormControl) {
    return null;
  }

  mouseDown(e) {
    if (!this.dragging && (!e.touches || e.touches.length === 1) && !this.detailsMode) {
      this.draggingStart = true;
      this.dragging = true;
      this.mouseOffset = [this.convertEvent(e).offsetX, this.convertEvent(e).offsetY];

      this.draggingStartTimeout = setTimeout(() => {
        this.draggingStart = false;
      }, 200);
    }
  }

  mouseMove(e) {
    if (this.dragging && (!e.touches || e.touches.length === 1) && !this.detailsMode) {
      const x = this.toPercentage(this.convertEvent(e).pageX - this.mouseOffset[0], 'x');
      const y = this.toPercentage(this.convertEvent(e).pageY - this.mouseOffset[1], 'y');
      if (x > 0 && x + this.toPercentage(300, 'x') < 100 && y > 0 && y + this.toPercentage(214, 'y') < 100) {
        this.coordinates = [x, y];
      }
    }
  }

  mouseUp(e) {
    if (this.draggingStartTimeout) {
      clearTimeout(this.draggingStartTimeout);
    }

    if (this.dragging) {
      const base = this.base;
      base.position.x = this.coordinates[0];
      base.position.y = this.coordinates[1];
      this.base = base;
      this.dragging = false;
    }

    if (this.draggingStart) {
      this.draggingStart = false;
      this.dragging = false;
      this.seeMoreDetails();
    }
  }

  private convertEvent(event) {
    if ('targetTouches' in event) {
      const bouncingRect = this.baseRef.nativeElement.getBoundingClientRect();
      return {
        pageX: event.targetTouches[0].pageX,
        pageY: event.targetTouches[0].pageY,
        offsetX: event.targetTouches[0].pageX - bouncingRect.left - (window.pageXOffset || document.documentElement.scrollLeft),
        offsetY: event.targetTouches[0].pageY - bouncingRect.top - (window.pageYOffset || document.documentElement.scrollTop)
      };
    } else {
      return {
        pageX: event.pageX,
        pageY: event.pageY,
        offsetX: event.offsetX,
        offsetY: event.offsetY
      };
    }
  }

  private toPercentage(value: number, direction: string): number {
    if (direction === 'x') {
      return value * 100 / window.innerWidth;
    } else if (direction === 'y') {
      return value * 100 / window.innerHeight;
    } else {
      return value;
    }
  }

  ngOnDestroy() {
    this.openedModifierTimeout.forEach(timeout => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });
  }
}
