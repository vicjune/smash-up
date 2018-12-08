import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { GameModule } from './game/game.module';
import { InitModule } from './init/init.module';
import { localStorage } from '@shared/utils/localStorage';
import { LOCAL_STORAGE_DEVICE_ID, LOCAL_STORAGE_VERSION } from '@shared/constants';

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
  localStorageVersion = 6;

  constructor() {
    const deviceId = localStorage.get<string>(LOCAL_STORAGE_DEVICE_ID);

    if (localStorage.get<number>(LOCAL_STORAGE_VERSION) !== this.localStorageVersion) {
      localStorage.clear();
    }
    localStorage.set(LOCAL_STORAGE_VERSION, this.localStorageVersion);

    if (deviceId) {
      localStorage.set(LOCAL_STORAGE_DEVICE_ID, deviceId);
    }
  }
}
