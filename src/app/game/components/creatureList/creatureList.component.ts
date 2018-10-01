import { Component, Input, OnInit } from '@angular/core';
import { PlayerService } from '@shared/services/player.service';
import { BaseService } from '@shared/services/base.service';
import { Base } from '@shared/models/base';
import { Creature } from '@shared/models/creature';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-creature-list',
  templateUrl: './creatureList.component.html',
  styleUrls: ['./creatureList.component.scss'],
})
export class CreatureListComponent implements OnInit {
  @Input() base: Base;

  players = this.playerService.bind();
  creatureList: Observable<string[][]>;

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
  ) {}

  ngOnInit() {
    this.creatureList = this.baseService.getCreatureOrderedList(this.base.id);
  }

  createCreature(ownerId: string, strength?: number) {
    this.baseService.createCreature(new Creature(ownerId, strength), this.base.id);
  }
}
