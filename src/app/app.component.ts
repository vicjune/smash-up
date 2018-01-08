import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    translate: TranslateService
  ) {
    translate.setDefaultLang('en');

    let lang;
    try {
      lang = window.localStorage.getItem('i18n');
    } catch (e) {
      console.error('This browser does not support local storage');
    }

    if (!lang) {
      lang = window.navigator.language;
    }

    if (lang !== 'en' && lang !== 'fr') {
      lang = 'en';
    }

    translate.use(lang);
  }
}
