import { Injectable } from '@angular/core';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntityService } from '@shared/services/entity.service';
import { PlayerService } from '@shared/services/player.service';
import { Creature } from '@shared/models/creature';
import { Player } from '@shared/models/player';
import { localStorage } from '@shared/utils/localStorage';
import { Draggable } from '@shared/utils/draggable';

@Injectable()
export class CreatureService extends EntityService {
  deleteCreatureEvent$ = new Subject<string>();

  creatureDraggable: Draggable;
  private dragging$ = new BehaviorSubject<string>(null);
  private draggingCoordinates$ = new BehaviorSubject<number[]>(null);

  protected entity = 'creatures';

  constructor(
    private playerService: PlayerService
  ) {
    super();
    const creatures = localStorage.get<Creature[]>(this.entity);

    if (creatures) {
      this.entities$.next(creatures);
    }

    playerService.bind().subscribe(players => this.removeExcessCreatures(players));
  }

  get deleteCreatureEvent(): Observable<string> {
    return this.deleteCreatureEvent$.asObservable();
  }

  bind(): Observable<Creature[]> {
    return combineLatest(
      super.bind(),
      this.playerService.bind(),
    ).pipe(map(([creatures, players]) => creatures.map((creature: Creature) => {
      creature.owner = players.find(player => player.id === creature.ownerId);
      creature.strength = this.getStrength(creature, players);
      return creature;
    })));
  }

  bindDragging(): Observable<string> {
    return this.dragging$.asObservable();
  }

  bindDraggingCoordinates(): Observable<number[]> {
    return this.draggingCoordinates$.asObservable();
  }

  delete(creatureId: string) {
    this.deleteCreatureEvent$.next(creatureId);
    super.delete(creatureId);
  }

  toggleDragMode(creatureId: string, dragging: boolean) {
    this.dragging$.next(dragging ? creatureId : null);
    if (!dragging) {
      this.draggingCoordinates$.next(null);
    }
  }

  setDraggingCoordinates(coordinates: number[]) {
    this.draggingCoordinates$.next(coordinates);
  }

  triggerDrop(coordinates: number[], creatureId: string) {

  }

  private getStrength(creature: Creature, players: Player[]): number {
    let strength = creature.basicStrength + creature.bonusStrength;
    const owner = players.find(player => player.id === creature.ownerId);
    if (owner && owner.playing) {
      strength += creature.modifierDuringOwnerTurn;
    }
    return strength > 0 ? strength : 0;
  }

  private removeExcessCreatures(players: Player[]) {
    const creatures = this.entities$.getValue() as Creature[];
    let i = creatures.length;
    while (i--) {
      if (creatures[i].ownerId !== 'monster' && !players.find(player => player.id === creatures[i].ownerId)) {
        this.delete(creatures[i].id);
      }
    }
  }
}
