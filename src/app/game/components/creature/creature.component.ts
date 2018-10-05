import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CreatureService } from '@shared/services/creature.service';
import { Creature } from '@shared/models/creature';
import { Draggable } from '@shared/utils/draggable';

@Component({
  selector: 'app-creature',
  templateUrl: './creature.component.html',
  styleUrls: ['./creature.component.scss'],
})
export class CreatureComponent implements OnInit {
  @Input() creatureId: string;
  @Input() detailModeCreatureId: string;
  @Output() toggleDetailMode = new EventEmitter<void>();

  creature$: Observable<Creature>;
  strengthBonus$: Observable<string>;
  bonusStrengthPositive = true;

  draggable = new Draggable();

  get detailsMode() {
    return this.detailModeCreatureId === this.creatureId;
  }

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

    this.draggable.clickEvent.subscribe(() => this.seeMoreDetails());
  }

  seeMoreDetails() {
    this.toggleDetailMode.emit();
  }

  mouseDown(e) {
    this.draggable.mouseDown(e);
  }

  mouseUp() {
    this.draggable.mouseUp();
  }
}
