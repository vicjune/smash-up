import { Component, Input } from '@angular/core';
import { PlayerService } from '@shared/services/player.service';
import { BaseService } from '@shared/services/base.service';
import { Base } from '@shared/models/base';
import { Creature } from '@shared/models/creature';

@Component({
  selector: 'app-creature-list',
  templateUrl: './creatureList.component.html',
  styleUrls: ['./creatureList.component.scss'],
})
export class CreatureListComponent {
  @Input() base: Base;

  players = this.playerService.bind();

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
  ) {}

  createCreature(ownerId: string, strength?: number) {
    this.baseService.createCreature(new Creature(ownerId, strength), this.base.id);
  }
}
