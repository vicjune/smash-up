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
  deletePopin = false;
  conquerPopin = false;
  newBase = false;
  conqueringBase: Base;
  deletingBase: Base;
  MAX_BASES: number = MAX_PLAYERS + 1;

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService,
  ) { }

  ngOnInit() {
  }

  deleteClicked(base: Base) {
    this.deletingBase = base;
    this.deletePopin = true;
  }

  conquerClicked(base: Base) {
    this.conqueringBase = base;
    if (base.resistance > 0) {
      this.conquerPopin = true;
    } else {
      this.baseService.conquer(base);
    }
  }

  addBase() {
    this.newBase = true;
    this.baseService.add(new Base());
  }

  editBase(base) {
    this.baseService.edit(base);
  }

  deleteBase(index) {
    if (index === 1) {
      this.baseService.delete(this.deletingBase.id);
    }
  }

  conquerBase(index) {
    if (index === 1) {
      this.baseService.conquer(this.conqueringBase);
    }
  }
}
