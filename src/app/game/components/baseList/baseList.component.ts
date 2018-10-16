import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from '@shared/services/base.service';
import { PlayerService } from '@shared/services/player.service';
import { Base } from '@shared/models/base';
import { MAX_PLAYERS } from '@shared/constants';
import { CreatureService } from '@shared/services/creature.service';

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
  bases$: Observable<Base[]>;
  MAX_BASES: number = MAX_PLAYERS + 1;
  creatureDragging$ = this.creatureService.bindDragging();

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService,
    public creatureService: CreatureService
  ) { }

  ngOnInit() {
    this.bases$ = this.baseService.bind();
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
      this.conquerBase(1);
    }
  }

  addBase() {
    this.newBase = true;
    this.baseService.add(new Base());
  }

  deleteBase(popinButtonIndex: number) {
    if (popinButtonIndex === 1) {
      this.baseService.delete(this.deletingBase.id);
    }
  }

  conquerBase(popinButtonIndex: number) {
    if (popinButtonIndex === 1) {
      this.baseService.conquer(this.conqueringBase);
    }
  }
}
