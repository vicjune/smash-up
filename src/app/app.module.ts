import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { GameModule } from './game/game.module';
import { InitModule } from './init/init.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    GameModule,
    InitModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
