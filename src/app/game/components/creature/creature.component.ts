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
  strengthDetail$: Observable<string>;

  constructor(
    public creatureService: CreatureService
  ) {}

  ngOnInit() {
    this.creature$ = this.creatureService.bindFromId(this.creatureId) as Observable<Creature>;
    this.strengthDetail$ = this.creature$.pipe(map((creature: Creature) => {
      if (creature && creature.strength !== creature.basicStrength) {
        const separator = (creature.strength - creature.basicStrength) > 0 ? '+' : '-';
        return `${creature.basicStrength} ${separator} ${creature.strength - creature.basicStrength}`;
      }
      return '';
    }));
  }
}
