import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PlayerService } from '@shared/services/player.service';
import { TimerService } from '@shared/services/timer.service';
import { Timer } from '@shared/models/timer';
import { DraggingService } from '@shared/services/dragging.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  timer$: Observable<Timer> = this.timerService.bind();
  timerBlinking$: Observable<boolean> = this.timer$.pipe(map(timer => timer.running && timer.value < 10));
  playerColor$: Observable<number> = this.playerService.bindPlayerPlaying().pipe(
    switchMap(playerId => this.playerService.bindFromId(playerId)),
    map(player => player.color)
  );
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  constructor(
    public timerService: TimerService,
    public playerService: PlayerService,
    public draggingService: DraggingService
  ) { }

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
