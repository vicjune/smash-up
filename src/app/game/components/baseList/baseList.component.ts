import { Component, OnInit } from '@angular/core';

import { BaseService } from '@shared/services/base.service';
import { PlayerService } from '@shared/services/player.service';
import { Base } from '@shared/models/base';
import { MAX_PLAYERS } from '@shared/constants';

@Component({
  selector: 'app-base-list',
  templateUrl: './baseList.component.html',
  styleUrls: ['./baseList.component.scss']
})
export class BaseListComponent implements OnInit {
  addPopin = false;
  deletePopin = false;
  conquerPopin = false;
  newBase: Base;
  conqueringBase: Base;
  MAX_BASES: number = MAX_PLAYERS + 1;

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService,
  ) { }

  ngOnInit() {
  }

  addClicked() {
    this.newBase = new Base(0, [0, 0, 0], this.baseService.getNewColor());
    this.addPopin = true;
  }

  deleteClicked(base: Base) {
    this.deletePopin = true;
  }

  conquerClicked(base: Base) {
    this.conqueringBase = base;
    if (base.resistance > 0) {
      this.conquerPopin = true;
    } else {
      this.conquerBase(base);
    }
  }

  addBase(index) {
    if (index === 1) {
      this.baseService.add(this.newBase);
    }
  }

  editBase(base) {
    this.baseService.edit(base);
  }

  deleteBase(base) {
    this.baseService.delete(base.id);
  }

  conquerBase(base) {
    this.baseService.conquer(base);
  }
}
