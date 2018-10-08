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
  totalBonusStrengthAbsolute$: Observable<number>;
  totalBonusStrengthSeparator$: Observable<string>;

  draggable = new Draggable();

  get detailsMode() {
    return this.detailModeCreatureId === this.creatureId;
  }

  constructor(
    public creatureService: CreatureService
  ) {}

  ngOnInit() {
    this.creature$ = this.creatureService.bindFromId(this.creatureId) as Observable<Creature>;
    this.totalBonusStrengthAbsolute$ = this.creature$.pipe(map((creature: Creature) => {
      return creature && Math.abs(creature.bonusStrength + (creature.owner.playing ? creature.modifierDuringOwnerTurn : 0));
    }));
    this.totalBonusStrengthSeparator$ = this.creature$.pipe(map((creature: Creature) => {
      if (creature && creature.strength !== creature.basicStrength) {
        return creature.strength - creature.basicStrength > 0 ? '+' : '-';
      }
      return null;
    }));

    this.draggable.clickEvent.subscribe(() => this.seeMoreDetails());
  }

  seeMoreDetails() {
    this.toggleDetailMode.emit();
  }

  increaseBaseStrength() {
    this.creatureService.editById(this.creatureId, (creature: Creature) => {
      creature.basicStrength ++;
      return creature;
    });
  }

  decreaseBaseStrength() {
    this.creatureService.editById(this.creatureId, (creature: Creature) => {
      if (creature.basicStrength > 0) {
        creature.basicStrength --;
      }
      return creature;
    });
  }

  increaseBonusStrength() {
    this.creatureService.editById(this.creatureId, (creature: Creature) => {
      creature.bonusStrength ++;
      return creature;
    });
  }

  decreaseBonusStrength() {
    this.creatureService.editById(this.creatureId, (creature: Creature) => {
      creature.bonusStrength --;
      return creature;
    });
  }

  increaseDuringTurnStrength() {
    this.creatureService.editById(this.creatureId, (creature: Creature) => {
      creature.modifierDuringOwnerTurn ++;
      return creature;
    });
  }

  decreaseDuringTurnStrength() {
    this.creatureService.editById(this.creatureId, (creature: Creature) => {
      creature.modifierDuringOwnerTurn --;
      return creature;
    });
  }

  delete() {
    this.toggleDetailMode.emit();
    this.creatureService.delete(this.creatureId);
  }

  mouseDown(e) {
    this.draggable.mouseDown(e);
  }

  mouseUp() {
    this.draggable.mouseUp();
  }
}
