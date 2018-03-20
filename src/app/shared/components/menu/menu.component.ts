import { TimerService } from '@shared/services/timer.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';

import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS, TIMER_SECONDS_INTERVAL } from '@shared/constants';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuOpen = false;
  deletePopin = false;
  resetPopin = false;
  removedPlayer: Player;
  language: string;
  MAX_PLAYERS: number = MAX_PLAYERS;
  TIMER_SECONDS_INTERVAL: number = TIMER_SECONDS_INTERVAL;

  @Output('addPlayer') addPlayer = new EventEmitter<void>();

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public translate: TranslateService,
    public timerService: TimerService
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe(event => {
      this.language = event.lang;
    });
  }

  addPlayerClicked() {
    this.addPlayer.emit();
    this.menuOpen = false;
  }

  deletePlayerClicked(player: Player) {
    this.removedPlayer = player;
    this.deletePopin = true;
    this.menuOpen = false;
  }

  callbackDelete(index: number) {
    if (index === 1) {
      this.playerService.delete(this.removedPlayer.id);
    }
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
    }
  }

  toggleTimer() {
    this.timerService.toggleActive();
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    try {
      window.localStorage.setItem('i18n', lang);
    } catch (e) {
      console.error('This browser does not support local storage');
    }
  }
}
