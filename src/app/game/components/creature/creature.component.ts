import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { CreatureService } from '@shared/services/creature.service';
import { Creature } from '@shared/models/creature';
import { Draggable } from '@shared/utils/draggable';
import { DraggingService } from '@shared/services/dragging.service';
import { MAX_CREATURE_CARD_ROTATION_DEG, MONSTER_OWNER_ID } from '@shared/constants';
import { PlayerService } from '@shared/services/player.service';
import { Player } from '@shared/models/player';

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
  owner$: Observable<Player>;
  transform$: Observable<string>;
  totalBonusStrengthAbsolute$: Observable<number>;
  totalBonusStrengthSeparator$: Observable<string>;

  translatePlayerParam: Observable<{playerName: string}>;

  draggable = new Draggable();

  subscription = new Subscription();

  MONSTER_OWNER_ID = MONSTER_OWNER_ID;

  get detailsMode() {
    return this.detailModeCreatureId === this.creatureId;
  }

  constructor(
    public creatureService: CreatureService,
    public draggingService: DraggingService,
    public playerService: PlayerService,
  ) {}

  ngOnInit() {
    this.draggable = this.otherDraggable || new Draggable();
    this.creature$ = this.creatureService.bindFromId(this.creatureId) as Observable<Creature>;

    this.owner$ = this.creature$.pipe(
      switchMap((creature: Creature) => {
        return this.playerService.bindFromId(creature.ownerId);
      })
    );

    this.totalBonusStrengthAbsolute$ = this.creature$.pipe(
      switchMap((creature: Creature) => {
        return this.playerService.bindFromId(creature.ownerId).pipe(
          map(owner => {
            return creature && Math.abs(
              creature.bonusStrength + (owner.playing ? creature.modifierDuringOwnerTurn : 0)
            );
          })
        );
      })
    );

    this.totalBonusStrengthSeparator$ = this.creature$.pipe(map((creature: Creature) => {
      if (creature && creature.strength !== creature.basicStrength) {
        return creature.strength - creature.basicStrength > 0 ? '+' : '-';
      }
      return null;
    }));

    this.translatePlayerParam = this.creature$.pipe(
      switchMap((creature: Creature) => {
        return this.playerService.bindFromId(creature.ownerId);
      }),
      map(owner => ({playerName: owner.name}))
    );

    this.transform$ = this.creature$.pipe(map(this.getTransform));

    this.subscription.add(this.draggable.clickEvent.subscribe(() => this.seeMoreDetails()));
    this.subscription.add(this.draggable.dragEvent.subscribe(dragging => this.toggleDragMode(dragging)));
    this.subscription.add(this.draggable.draggingEvent.subscribe(coordinates => this.sendDraggingCoordinates(coordinates)));
    this.subscription.add(this.draggable.dropEvent.subscribe(() => this.triggerDrop()));
  }

  seeMoreDetails() {
    this.toggleDetailMode.emit();
  }

  toggleDragMode(dragging: boolean) {
    this.draggingService.creatureDraggable = this.draggable;
    this.draggingService.toggleCreatureDragMode(this.creatureId, dragging);
  }

  sendDraggingCoordinates(coordinates: [number, number]) {
    this.draggingService.setCreatureDraggingCoordinates(coordinates);
  }

  triggerDrop() {
    this.draggingService.triggerCreatureDrop(this.creatureId);
  }

  increaseBaseStrength() {
    this.creatureService.edit(this.creatureId, (creature: Creature) => {
      creature.basicStrength ++;
      return creature;
    });
  }

  decreaseBaseStrength() {
    this.creatureService.edit(this.creatureId, (creature: Creature) => {
      if (creature.basicStrength > 0) {
        creature.basicStrength --;
      }
      return creature;
    });
  }

  increaseBonusStrength() {
    this.creatureService.edit(this.creatureId, (creature: Creature) => {
      creature.bonusStrength ++;
      return creature;
    });
  }

  decreaseBonusStrength() {
    this.creatureService.edit(this.creatureId, (creature: Creature) => {
      creature.bonusStrength --;
      return creature;
    });
  }

  increaseDuringTurnStrength() {
    this.creatureService.edit(this.creatureId, (creature: Creature) => {
      creature.modifierDuringOwnerTurn ++;
      return creature;
    });
  }

  decreaseDuringTurnStrength() {
    this.creatureService.edit(this.creatureId, (creature: Creature) => {
      creature.modifierDuringOwnerTurn --;
      return creature;
    });
  }

  delete() {
    this.toggleDetailMode.emit();
    this.creatureService.delete(this.creatureId);
  }

  getTransform(creature: Creature) {
    if (!creature) {
      return 'none';
    }
    return 'rotate(' + (Math.floor(
      creature.rotation * (MAX_CREATURE_CARD_ROTATION_DEG + MAX_CREATURE_CARD_ROTATION_DEG + 1)
    ) - MAX_CREATURE_CARD_ROTATION_DEG) + 'deg)';
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
