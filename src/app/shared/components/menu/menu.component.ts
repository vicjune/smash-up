import { TimerService } from '@shared/services/timer.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS, TIMER_SECONDS_INTERVAL } from '@shared/constants';
import { localStorage } from '@shared/utils/localStorage';
import { CreatureService } from '@shared/services/creature.service';
import { DraggingService } from '@shared/services/dragging.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuOpen = false;
  resetPopin = false;
  language = 'en';
  MAX_PLAYERS: number = MAX_PLAYERS;
  TIMER_SECONDS_INTERVAL: number = TIMER_SECONDS_INTERVAL;

  @Output('addPlayer') addPlayer = new EventEmitter<void>();

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public translate: TranslateService,
    public timerService: TimerService,
    public creatureService: CreatureService,
    public draggingService: DraggingService
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe(event => {
      this.language = event.lang;
    });
  }

  addPlayerClicked() {
    this.addPlayer.emit();
  }

  deletePlayer(playerId: string) {
    this.playerService.delete(playerId);
    this.draggingService.unregisterCoordinates(playerId);
  }

  resetClicked() {
    this.resetPopin = true;
    this.menuOpen = false;
  }

  callbackReset(index: number) {
    if (index === 1) {
      this.playerService.reset();
      this.baseService.reset();
      this.timerService.reset();
      this.creatureService.reset();
    }
  }

  toggleTimer() {
    this.timerService.toggleActive();
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.set('i18n', lang);
  }
}
