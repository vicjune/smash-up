import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

import { Timer, TimerType } from "../models/timer";
import {
  TIMER_SECONDS_INTERVAL,
  TIMER_BY_TURN_DEFAULT,
  TIMER_BY_PLAYER_DEFAULT,
  TIMER_ADDITIONNAL_TIME_DEFAULT,
  TIMER_BUFFER_TIME_DEFAULT,
} from "../constants";
import { PlayerService } from "./player.service";
import { localStorage } from "@shared/utils/localStorage";
import { AnalyticsService } from "./analytics.service";
import { Player } from "@shared/models/player";

@Injectable()
export class TimerService {
  private timerSubject: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(
    new Timer()
  );
  private interval;
  private sounds = [new Audio(), new Audio(), new Audio()];
  private soundLoaded = false;
  private playerPlayingId: string = "";

  constructor(
    private playerService: PlayerService,
    private analyticsService: AnalyticsService
  ) {
    const timer = localStorage.get<Timer>("timer");

    if (timer) {
      timer.running = false;
      if (timer.type === TimerType.BY_PLAYER) {
        timer.value = timer.bufferTime;
      } else {
        timer.value = timer.startValue;
      }
      this.preloadSounds(timer);
      this.timerSubject.next(timer);
    }

    this.playerService.bindPlayerPlaying().subscribe((playerPlayingId) => {
      this.playerPlayingId = playerPlayingId;
    });
  }

  get timer(): Timer {
    return this.timerSubject.getValue();
  }

  bind(): Observable<Timer> {
    return this.timerSubject.asObservable();
  }

  setType(type: TimerType): void {
    const timer = this.timer;
    timer.type = type;
    timer.startValue =
      type === TimerType.BY_PLAYER
        ? TIMER_BY_PLAYER_DEFAULT
        : TIMER_BY_TURN_DEFAULT;
    timer.additionnalTime = TIMER_ADDITIONNAL_TIME_DEFAULT;
    timer.bufferTime = TIMER_BUFFER_TIME_DEFAULT;
    this.preloadSounds(timer);
    this.reset();
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.analyticsService.updateTimer(timer);
  }

  toggleRunning(): void {
    const timer = this.timer;
    timer.running = !timer.running;
    this.timerSubject.next(timer);

    if (timer.running) {
      this.interval = setInterval(() => {
        const timerRunning = this.timer;
        if (timerRunning.type === TimerType.BY_TURN) {
          this.decrementTurnTimer(timerRunning);
        } else {
          this.decrementPlayerTimer(timerRunning);
        }
      }, 100);
    } else {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  }

  private decrementTurnTimer(timer: Timer) {
    const newTimer = timer.value - 1;
    this.checkSound(newTimer);
    this.timerSubject.next({ ...timer, value: newTimer });
  }

  private decrementPlayerTimer(timer: Timer) {
    if (timer.value > 0) {
      const newTimer = timer.value - 1;
      this.timerSubject.next({ ...timer, value: newTimer });
    } else {
      this.playerService.edit(this.playerPlayingId, (player: Player) => {
        let newTimer = player.timer - 1;
        this.checkSound(newTimer);
        if (newTimer === 0) {
          newTimer = timer.additionnalTime;
          this.playerService.updateScore(-1, this.playerPlayingId, true);
        }
        return { ...player, timer: newTimer };
      });
    }
  }

  private resetPlayerTimers() {
    const timer = this.timer;
    const playersId = this.playerService.entityList$.getValue();
    playersId.forEach((playerId) => {
      this.playerService.edit(playerId, (player: Player) => {
        player.timer = timer.startValue;
        return player;
      });
    });
  }

  incrementStartValue() {
    const timer = this.timer;
    timer.startValue = timer.startValue + TIMER_SECONDS_INTERVAL * 10;
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.reset();
  }

  decrementStartValue() {
    const timer = this.timer;
    if (
      timer.startValue - TIMER_SECONDS_INTERVAL * 10 >
      TIMER_SECONDS_INTERVAL * 10
    ) {
      timer.startValue = timer.startValue - TIMER_SECONDS_INTERVAL * 10;
    } else {
      timer.startValue = TIMER_SECONDS_INTERVAL * 10;
    }
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.reset();
  }

  incrementAdditionnalValue() {
    const timer = this.timer;
    timer.additionnalTime = timer.additionnalTime + TIMER_SECONDS_INTERVAL * 10;
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.reset();
  }

  decrementAdditionnalValue() {
    const timer = this.timer;
    if (
      timer.additionnalTime - TIMER_SECONDS_INTERVAL * 10 >
      TIMER_SECONDS_INTERVAL * 10
    ) {
      timer.additionnalTime =
        timer.additionnalTime - TIMER_SECONDS_INTERVAL * 10;
    } else {
      timer.additionnalTime = TIMER_SECONDS_INTERVAL * 10;
    }
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.reset();
  }

  incrementBufferValue() {
    const timer = this.timer;
    timer.bufferTime = timer.bufferTime + 10;
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.reset();
  }

  decrementBufferValue() {
    const timer = this.timer;
    if (timer.bufferTime - 10 > 0) {
      timer.bufferTime = timer.bufferTime - 10;
    } else {
      timer.bufferTime = 0;
    }
    this.timerSubject.next(timer);
    this.storeInLocalStorage();
    this.reset();
  }

  nextPlayer(): void {
    const timer = this.timer;
    timer.value = timer.startValue;
    if (timer.type === TimerType.BY_PLAYER) {
      timer.value = timer.bufferTime;
    } else {
      timer.value = timer.startValue;
    }
    this.timerSubject.next(timer);
    this.playerService.nextPlayerPlaying();
  }

  reset(): void {
    const timer = this.timer;
    timer.running = false;
    if (timer.type === TimerType.BY_PLAYER) {
      timer.value = timer.bufferTime;
      this.resetPlayerTimers();
    } else {
      timer.value = timer.startValue;
    }
    this.timerSubject.next(timer);
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private checkSound(time: number) {
    if (time === 200 || time === 300) {
      this.sounds[0].play();
    }
    if (time <= 100 && time > 0 && time % 10 === 0) {
      this.sounds[1].play();
    }
    if (time === 0) {
      this.sounds[2].play();
    }
  }

  private preloadSounds(timer: Timer) {
    if (timer.type !== TimerType.OFF && !this.soundLoaded) {
      this.sounds[0].src = "../../../assets/sounds/metal_gong.mp3";
      this.sounds[1].src = "../../../assets/sounds/tick.mp3";
      this.sounds[2].src = "../../../assets/sounds/chinese_gong.mp3";
      this.sounds.forEach((sound) => sound.load());
      this.soundLoaded = true;
    }
  }

  private storeInLocalStorage() {
    localStorage.set("timer", this.timer);
  }
}
