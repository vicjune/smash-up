import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Timer } from '../models/timer';
import { PlayerService } from './player.service';

@Injectable()
export class TimerService {
  private timerSubject: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(new Timer());
  private interval;

  constructor(
    private playerService: PlayerService
  ) {
    let localTimer;
    try {
      localTimer = window.localStorage.getItem('timer');
    } catch (e) {
      console.error('This browser does not support local storage');
    }

    if (localTimer) {
      this.timerSubject.next(JSON.parse(localTimer) as Timer);
    }
  }

  bind(): Observable<Timer> {
    return this.timerSubject.asObservable();
  }

  bindWarningDisplay(): Observable<boolean> {
    return this.timerSubject.map(timer => timer.value % 10 === 0 && timer.value <= 0 && timer.active && timer.running);
  }

  toggleActive(): void {
    const timer = this.timerSubject.getValue();
    timer.active = !timer.active;
    if (!timer.active) {
      this.reset();
    }
    this.timerSubject.next(timer);
  }

  toggleRunning(): void {
    const timer = this.timerSubject.getValue();
    timer.running = !timer.running;
    this.timerSubject.next(timer);

    if (timer.running) {
      this.interval = setInterval(() => {
        const timerRunning = this.timerSubject.getValue();
        timerRunning.value --;
        this.timerSubject.next(timerRunning);
      }, 100);
    } else {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  }

  setStartValue(value: number) {
    const timer = this.timerSubject.getValue();
    timer.startValue = value;
    this.timerSubject.next(timer);
  }

  nextPlayer(): void {
    const timer = this.timerSubject.getValue();
    timer.value = timer.startValue;
    this.timerSubject.next(timer);
    this.playerService.nextPlayerPlaying();
  }

  reset(): void {
    this.timerSubject.next(new Timer());
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
