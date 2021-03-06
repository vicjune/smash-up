import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { Timer } from '../models/timer';
import { TIMER_SECONDS_INTERVAL, TIMER_DEFAULT } from '../constants';
import { PlayerService } from './player.service';
import { localStorage } from '@shared/utils/localStorage';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class TimerService {
  private timerSubject: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(new Timer());
  private interval;
  private sounds = [
    new Audio(),
    new Audio(),
    new Audio(),
  ];
  private soundLoaded = false;

  constructor(
    private playerService: PlayerService,
    private analyticsService: AnalyticsService
  ) {
    const timer = localStorage.get<Timer>('timer');

    if (timer) {
      timer.running = false;
      timer.value = timer.startValue;
      this.preloadSounds(timer);
      this.timerSubject.next(timer);
    }
  }

  bind(): Observable<Timer> {
    return this.timerSubject.asObservable();
  }

  toggleActive(): void {
    const timer = this.timerSubject.getValue();
    timer.active = !timer.active;
    timer.startValue = TIMER_DEFAULT;
    this.preloadSounds(timer);
    this.reset();
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.analyticsService.updateTimer(timer);
  }

  toggleRunning(): void {
    const timer = this.timerSubject.getValue();
    timer.running = !timer.running;
    this.timerSubject.next(timer);

    if (timer.running) {
      this.interval = setInterval(() => {
        const timerRunning = this.timerSubject.getValue();
        timerRunning.value --;
        this.checkSound(timerRunning.value);
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

  nextPlayer(): void {
    const timer = this.timerSubject.getValue();
    timer.value = timer.startValue;
    this.timerSubject.next(timer);
    this.playerService.nextPlayerPlaying();
  }

  resetToDefaultValue() {
    const timer = this.timerSubject.getValue();
    timer.value = timer.startValue;
    this.timerSubject.next(timer);
  }

  reset(): void {
    const timer = this.timerSubject.getValue();
    timer.value = timer.startValue;
    timer.running = false;
    this.timerSubject.next(timer);
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private checkSound(timer) {
    if (timer === 200 || timer === 300) {
      this.sounds[0].play();
    }
    if (timer <= 100 && timer > 0 && timer % 10 === 0) {
      this.sounds[1].play();
    }
    if (timer === 0) {
      this.sounds[2].play();
    }
  }

  private preloadSounds(timer: Timer) {
    if (timer.active && !this.soundLoaded) {
      this.sounds[0].src = '../../../assets/sounds/metal_gong.mp3';
      this.sounds[1].src = '../../../assets/sounds/tick.mp3';
      this.sounds[2].src = '../../../assets/sounds/chinese_gong.mp3';
      this.sounds.forEach(sound => sound.load());
      this.soundLoaded = true;
    }
  }

  private storeInLocalStorage() {
    localStorage.set('timer', this.timerSubject.getValue());
  }
}
