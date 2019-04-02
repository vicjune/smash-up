import { TimerService } from '@shared/services/timer.service';
import { Component, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS, TIMER_SECONDS_INTERVAL, LOCAL_STORAGE_I18N } from '@shared/constants';
import { localStorage } from '@shared/utils/localStorage';
import { CreatureService } from '@shared/services/creature.service';
import { DraggingService } from '@shared/services/dragging.service';
import { AnalyticsService } from '@shared/services/analytics.service';
import { windowEvents } from '@shared/utils/windowEvents';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Output() addPlayer = new EventEmitter<void>();

  menuOpen = false;
  resetPopin = false;
  language$: Observable<string>;
  MAX_PLAYERS: number = MAX_PLAYERS;
  TIMER_SECONDS_INTERVAL: number = TIMER_SECONDS_INTERVAL;

  fullscreen$ = windowEvents.fullscreen;

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public translate: TranslateService,
    public timerService: TimerService,
    public creatureService: CreatureService,
    public draggingService: DraggingService,
    public analyticsService: AnalyticsService
  ) {
    this.language$ = this.translate.onLangChange.pipe(
      map(event => event.lang)
    );
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
    localStorage.set(LOCAL_STORAGE_I18N, lang);
    this.analyticsService.updateLang(lang);
  }

  toggleFullscreen() {
    windowEvents.toggleFullscreen();
  }
}
