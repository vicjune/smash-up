import { Injectable } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntityService } from '@shared/services/entity.service';
import { PlayerService } from '@shared/services/player.service';
import { Creature } from '@shared/models/creature';
import { Player } from '@shared/models/player';
import { localStorage } from '@shared/utils/localStorage';

@Injectable()
export class CreatureService extends EntityService {
  deleteCreatureEvent$ = new Subject<string>();

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

  swichOwner(creature: Creature, newOwnerId: string) {
    creature.ownerId = newOwnerId;
    this.edit(creature);
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
    (this.entities$.getValue() as Creature[])
      .filter(creature => !players.find(player => player.id === creature.ownerId))
      .forEach(creature => {
        this.delete(creature.id);
        this.deleteCreatureEvent$.next(creature.id);
      });
  }
}
