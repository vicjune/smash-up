import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { GameModule } from './game/game.module';
import { InitModule } from './init/init.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    GameModule,
    InitModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  localStorageVersion = 1;

  constructor() {
    let version = this.localStorageVersion;
    let players = null;

    try {
      version = JSON.parse(window.localStorage.getItem('version'));
      players = JSON.parse(window.localStorage.getItem('players'));
    } catch (e) {
      console.error('This browser does not support local storage');
    }

    if (version !== this.localStorageVersion && players !== null) {
      try {
        window.localStorage.clear();
      } catch (e) {
        console.error('This browser does not support local storage');
      }
    }

    try {
      window.localStorage.setItem('version', JSON.stringify(this.localStorageVersion));
    } catch (e) {
      console.error('This browser does not support local storage');
    }
  }
}
