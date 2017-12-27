import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayerListComponent } from './components/playerList/playerList.component';
import { MenuComponent } from './components/menu/menu.component';
import { PlayerService } from './services/player.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PlayerListComponent,
    MenuComponent,
  ],
  exports: [
    PlayerListComponent,
    MenuComponent,
  ],
  providers: [
    PlayerService
  ]
})
export class SharedModule { }
