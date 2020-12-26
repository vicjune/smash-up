import {
  TIMER_BY_TURN_DEFAULT,
  TIMER_ADDITIONNAL_TIME_DEFAULT,
  TIMER_BUFFER_TIME_DEFAULT,
} from "./../constants";

export enum TimerType {
  OFF = "OFF",
  BY_TURN = "BY_TURN",
  BY_PLAYER = "BY_PLAYER",
}

export class Timer {
  type: TimerType;
  startValue: number;
  additionnalTime: number;
  bufferTime: number;
  value: number;
  running: boolean;

  constructor() {
    this.type = TimerType.OFF;
    this.startValue = TIMER_BY_TURN_DEFAULT;
    this.additionnalTime = TIMER_ADDITIONNAL_TIME_DEFAULT;
    this.bufferTime = TIMER_BUFFER_TIME_DEFAULT;
    this.value = this.startValue;
    this.running = false;
  }
}
