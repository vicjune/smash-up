import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { TimerPipe } from './pipes/timer.pipe';
import { PlayerListComponent } from './components/playerList/playerList.component';
import { MenuComponent } from './components/menu/menu.component';
import { PlayerService } from './services/player.service';
import { PopinComponent } from './components/popin/popin.component';
import { BaseService } from '@shared/services/base.service';
import { TimerService } from '@shared/services/timer.service';
import { TimerComponent } from '@shared/components/timer/timer.component';
import { CreatureService } from '@shared/services/creature.service';
import { DraggingService } from './services/dragging.service';
import { PlayerComponent } from './components/player/player.component';
import { AnalyticsService } from './services/analytics.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
  ],
  declarations: [
    PlayerListComponent,
    MenuComponent,
    PopinComponent,
    TimerComponent,
    TimerPipe,
    PlayerComponent,
  ],
  exports: [
    PlayerListComponent,
    MenuComponent,
    PopinComponent,
    TimerComponent,
    TranslateModule,
    CommonModule,
    FormsModule,
    TimerPipe,
    PlayerComponent,
  ],
  providers: [
    PlayerService,
    BaseService,
    TimerService,
    CreatureService,
    DraggingService,
    AnalyticsService
  ]
})
export class SharedModule { }
