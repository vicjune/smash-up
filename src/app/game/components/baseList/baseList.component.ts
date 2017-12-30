import { Component, OnInit } from '@angular/core';

import { BaseService } from '@shared/services/base.service';
import { Base } from '@shared/models/base';

@Component({
  selector: 'app-base-list',
  templateUrl: './baseList.component.html',
  styleUrls: ['./baseList.component.scss']
})
export class BaseListComponent implements OnInit {
  addPopin = false;
  newBase: Base;

  constructor(
    public baseService: BaseService
  ) { }

  ngOnInit() {
  }

  addBaseClicked() {
    this.newBase = new Base(0, 0, [0, 0, 0]);
    this.addPopin = true;
  }

  addBase(index) {
    if (index === 1) {
      this.baseService.add(this.newBase);
    }
  }

  editBase(base) {
    this.baseService.edit(base);
  }
}
