import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { CreatureService } from '@shared/services/creature.service';
import { Creature } from '@shared/models/creature';
import { Draggable } from '@shared/utils/draggable';

@Component({
  selector: 'app-creature',
  templateUrl: './creature.component.html',
  styleUrls: ['./creature.component.scss'],
})
export class CreatureComponent implements OnInit, OnDestroy {
  @Input() creatureId: string;
  @Input() detailModeCreatureId: string;
  @Input() creatureDragging = false;
  @Input() otherDraggable: Draggable = null;
  @Output() toggleDetailMode = new EventEmitter<void>();

  creature$: Observable<Creature>;
  totalBonusStrengthAbsolute$: Observable<number>;
  totalBonusStrengthSeparator$: Observable<string>;

  translatePlayerParam: Observable<{playerName: string}>;

  draggable = new Draggable();

  subscription = new Subscription();

  get detailsMode() {
    return this.detailModeCreatureId === this.creatureId;
  }

  constructor(
    public creatureService: CreatureService
  ) {}

  ngOnInit() {
    this.draggable = this.otherDraggable || new Draggable();

    this.creature$ = this.creatureService.bindFromId(this.creatureId) as Observable<Creature>;
    this.totalBonusStrengthAbsolute$ = this.creature$.pipe(map((creature: Creature) => {
      return creature && Math.abs(
        creature.bonusStrength + (creature.owner && creature.owner.playing ? creature.modifierDuringOwnerTurn : 0)
      );
    }));
    this.totalBonusStrengthSeparator$ = this.creature$.pipe(map((creature: Creature) => {
      if (creature && creature.strength !== creature.basicStrength) {
        return creature.strength - creature.basicStrength > 0 ? '+' : '-';
      }
      return null;
    }));
    this.translatePlayerParam = this.creature$.pipe(map((creature: Creature) => {
      return {playerName: creature ? creature.owner.name : ''};
    }));

    this.subscription.add(this.draggable.clickEvent.subscribe(() => this.seeMoreDetails()));
    this.subscription.add(this.draggable.dragEvent.subscribe(dragging => this.toggleDragMode(dragging)));
  }

  seeMoreDetails() {
    this.toggleDetailMode.emit();
  }

  toggleDragMode(dragging: boolean) {
    this.creatureService.creatureDraggable = this.draggable;
    this.creatureService.toggleDragMode(this.creatureId, dragging);
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

  mouseMove(e) {
    this.draggable.mouseMove(e);
  }

  mouseUp() {
    this.draggable.mouseUp();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
