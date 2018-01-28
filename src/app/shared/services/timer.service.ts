import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { TIMER_DEFAULT } from './../constants';

@Injectable()
export class TimerService {
  private timerActiveSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private timerMaxSubject: BehaviorSubject<number> = new BehaviorSubject<number>(TIMER_DEFAULT);
  private timerSubject: BehaviorSubject<number> = new BehaviorSubject<number>(TIMER_DEFAULT);

  constructor() {
    let localTimer;
    let localTimerMax;
    let localTimerActive;
    try {
      localTimer = window.localStorage.getItem('timer');
      localTimerMax = window.localStorage.getItem('timerMax');
      localTimerActive = window.localStorage.getItem('timerActive');
    } catch (e) {
      console.error('This browser does not support local storage');
    }

    if (localTimer) {
      this.timerSubject.next(JSON.parse(localTimer) as number);
    }

    if (localTimerMax) {
      this.timerMaxSubject.next(JSON.parse(localTimerMax) as number);
    }

    if (localTimerActive) {
      this.timerActiveSubject.next(JSON.parse(localTimerActive) as boolean);
    }
  }

  bindTimer(): Observable<number> {
    return this.timerSubject.asObservable();
  }

  bindTimerMax(): Observable<number> {
    return this.timerMaxSubject.asObservable();
  }

  bindTimerActive(): Observable<boolean> {
    return this.timerActiveSubject.asObservable();
  }

  bindWarningDisplay(): Observable<boolean> {
    return this.timerSubject.map(timer => timer % 10 === 0 && timer <= 0);
  }

  toggleTimer(): void {
    const timerActive = this.timerActiveSubject.getValue();
    this.timerActiveSubject.next(!timerActive);
  }

  reset(): void {
    this.timerSubject.next(TIMER_DEFAULT);
    this.timerMaxSubject.next(TIMER_DEFAULT);
    this.timerActiveSubject.next(false);
  }
}
