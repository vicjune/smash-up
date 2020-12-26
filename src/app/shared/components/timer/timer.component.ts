import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { map, switchMap, filter } from "rxjs/operators";

import { PlayerService } from "@shared/services/player.service";
import { TimerService } from "@shared/services/timer.service";
import { Timer, TimerType } from "@shared/models/timer";
import { DraggingService } from "@shared/services/dragging.service";
import { Player } from "@shared/models/player";

@Component({
  selector: "app-timer",
  templateUrl: "./timer.component.html",
  styleUrls: ["./timer.component.scss"],
})
export class TimerComponent {
  TimerType = TimerType;
  timer$: Observable<Timer> = this.timerService.bind();
  timerBlinking$: Observable<boolean> = this.timer$.pipe(
    map((timer) => timer.running && timer.value < 0)
  );
  playerPlaying$: Observable<Player> = this.playerService
    .bindPlayerPlaying()
    .pipe(switchMap((playerId) => this.playerService.bindFromId(playerId)));
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  constructor(
    public timerService: TimerService,
    public playerService: PlayerService,
    public draggingService: DraggingService
  ) {}

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
