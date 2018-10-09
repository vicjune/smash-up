import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { Timer } from '../models/timer';
import { TIMER_SECONDS_INTERVAL, TIMER_DEFAULT } from '../constants';
import { PlayerService } from './player.service';
import { localStorage } from '@shared/utils/localStorage';

@Injectable()
export class TimerService {
  private timerSubject: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(new Timer());
  private interval;

  constructor(
    private playerService: PlayerService
  ) {
    const timer = localStorage.get<Timer>('timer', localTimer => {
      localTimer.running = false;
      localTimer.value = localTimer.startValue;
      return localTimer;
    });

    if (timer) {
      this.timerSubject.next(timer);
    }
  }

  bind(): Observable<Timer> {
    return this.timerSubject.asObservable();
  }

  toggleActive(): void {
    const timer = this.timerSubject.getValue();
    timer.active = !timer.active;
    this.reset();
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
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

  incrementStartValue() {
    const timer = this.timerSubject.getValue();
    timer.startValue = timer.startValue + 50;
    if (!timer.running) {
      timer.value = timer.startValue;
    }
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
  }

  decrementStartValue() {
    const timer = this.timerSubject.getValue();
    if (timer.startValue - (TIMER_SECONDS_INTERVAL * 10) > (TIMER_SECONDS_INTERVAL * 10)) {
      timer.startValue = timer.startValue - (TIMER_SECONDS_INTERVAL * 10);
    } else {
      timer.startValue = (TIMER_SECONDS_INTERVAL * 10);
    }
    if (!timer.running) {
      timer.value = timer.startValue;
    }
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
  }

  resetStartValue() {
    const timer = this.timerSubject.getValue();
    timer.startValue = TIMER_DEFAULT;
    if (!timer.running) {
      timer.value = timer.startValue;
    }
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
  }

  nextPlayer(): void {
    const timer = this.timerSubject.getValue();
    timer.value = timer.startValue;
    this.timerSubject.next(timer);
    this.playerService.nextPlayerPlaying();
  }

  reset(): void {
    const timer = this.timerSubject.getValue();
    timer.running = false;
    timer.value = timer.startValue;
    this.timerSubject.next(timer);
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private storeInLocalStorage() {
    localStorage.set('timer', this.timerSubject.getValue());
  }
}
