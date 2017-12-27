import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PlayerListComponent } from './components/playerList/playerList.component';
import { MenuComponent } from './components/menu/menu.component';
import { PlayerService } from './services/player.service';
import { PopinComponent } from './components/popin/popin.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    PlayerListComponent,
    MenuComponent,
    PopinComponent,
  ],
  exports: [
    PlayerListComponent,
    MenuComponent,
    PopinComponent,
  ],
  providers: [
    PlayerService
  ]
})
export class SharedModule { }
