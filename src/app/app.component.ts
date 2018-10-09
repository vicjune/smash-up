import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { localStorage } from '@shared/utils/localStorage';

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

    let lang = localStorage.get<string>('i18n');

    if (!lang) {
      lang = window.navigator.language;
    }

    if (lang !== 'en' && lang !== 'fr') {
      lang = 'en';
    }

    translate.use(lang);
  }
}
