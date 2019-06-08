import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

document.body.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
  },
  false
);

document.body.addEventListener(
  'mousedown',
  (e) => {
    e.preventDefault();
  },
  false
);
