import { TIMER_DEFAULT } from './../constants';

export class Timer {
  active: boolean;
  startValue: number;
  value: number;
  running: boolean;

  constructor () {
    this.active = false;
    this.startValue = TIMER_DEFAULT;
    this.value = this.startValue;
    this.running = false;
  }
}
