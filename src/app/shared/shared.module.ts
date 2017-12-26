import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayerComponent } from './components/player/player.component';
import { PlayerListComponent } from './components/playerList/playerList.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PlayerComponent,
    PlayerListComponent,
  ],
  exports: [
    PlayerComponent,
    PlayerListComponent,
  ]
})
export class SharedModule { }
