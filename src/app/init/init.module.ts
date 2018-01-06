import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';
import { InitComponent } from './pages/init/init.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    InitComponent
  ],
  exports: [
    InitComponent,
  ]
})
export class InitModule { }
