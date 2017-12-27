import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayerListComponent } from './components/playerList/playerList.component';
import { PlayerService } from './services/player.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PlayerListComponent,
  ],
  exports: [
    PlayerListComponent,
  ],
  providers: [
    PlayerService
  ]
})
export class SharedModule { }
