import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CreatureService } from '@shared/services/creature.service';
import { Creature } from '@shared/models/creature';

@Component({
  selector: 'app-creature',
  templateUrl: './creature.component.html',
  styleUrls: ['./creature.component.scss'],
})
export class CreatureComponent implements OnInit {
  @Input() creatureId: string;

  creature$: Observable<Creature>;
  strengthBonus$: Observable<string>;
  bonusStrengthPositive = true;

  constructor(
    public creatureService: CreatureService
  ) {}

  ngOnInit() {
    this.creature$ = this.creatureService.bindFromId(this.creatureId) as Observable<Creature>;
    this.strengthBonus$ = this.creature$.pipe(map((creature: Creature) => {
      if (creature && creature.strength !== creature.basicStrength) {
        this.bonusStrengthPositive = (creature.strength - creature.basicStrength) > 0;
        const separator = this.bonusStrengthPositive ? '+' : '-';
        return `${separator} ${Math.abs(creature.strength - creature.basicStrength)}`;
      }
      return '';
    }));
  }
}
