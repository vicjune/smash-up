import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainComponent } from './pages/main/main.component';
import { BaseComponent } from './components/base/base.component';
import { PlayerComponent } from './components/player/player.component';
import { PlayerListComponent } from './components/playerList/playerList.component';
import { BaseListComponent } from './components/baseList/baseList.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    MainComponent,
    BaseComponent,
    BaseListComponent,
    PlayerComponent,
    PlayerListComponent,
  ],
  exports: [
    MainComponent,
    BaseComponent,
    BaseListComponent,
    PlayerComponent,
    PlayerListComponent,
  ]
})
export class SharedModule { }
