import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';
import { GameComponent } from './pages/game/game.component';
import { BaseComponent } from './components/base/base.component';
import { BaseListComponent } from './components/baseList/baseList.component';
import { CreatureListComponent } from './components/creatureList/creatureList.component';
import { CreatureComponent } from './components/creature/creature.component';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    GameComponent,
    BaseComponent,
    BaseListComponent,
    CreatureListComponent,
    CreatureComponent,
  ],
  exports: [
    GameComponent,
  ]
})
export class GameModule { }
