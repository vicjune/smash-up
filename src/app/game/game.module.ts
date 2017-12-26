import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from './../shared/shared.module';
import { GameComponent } from './pages/game/game.component';
import { BaseComponent } from './components/base/base.component';
import { BaseListComponent } from './components/baseList/baseList.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    GameComponent,
    BaseComponent,
    BaseListComponent,
  ],
  exports: [
    GameComponent,
  ]
})
export class GameModule { }
