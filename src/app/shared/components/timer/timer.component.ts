import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { PlayerService } from '@shared/services/player.service';
import { TimerService } from '@shared/services/timer.service';
import { Timer } from '@shared/models/timer';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  timer: Observable<Timer> = this.timerService.bind();
  timerBlinking: Observable<boolean> = this.timer.map(timer => timer.running && timer.value <= 0);
  playerColor: Observable<number> = this.playerService.bindPlayerPlaying().map(player => player.color);

  constructor(
    public timerService: TimerService,
    public playerService: PlayerService,
  ) { }

  ngOnInit() {
  }

  playToggle() {
    this.timerService.toggleRunning();
  }

  resetTimer() {
    this.timerService.reset();
  }

  nextPlayer() {
    this.timerService.nextPlayer();
  }
}
