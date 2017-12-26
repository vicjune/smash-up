import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from './../shared/shared.module';
import { InitComponent } from './pages/init/init.component';

@NgModule({
  imports: [
    CommonModule,
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
