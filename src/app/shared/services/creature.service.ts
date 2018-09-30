import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

import { EntityService } from '@shared/services/entity.service';
import { PlayerService } from '@shared/services/player.service';
import { Creature } from '@shared/models/creature';
import { BaseService } from '@shared/services/base.service';
import { Player } from '@shared/models/player';

@Injectable()
export class CreatureService extends EntityService {
  deleteCreatureEventSubject = new Subject<string>();

  protected entity = 'creatures';

  constructor(
    private playerService: PlayerService
  ) {
    super();
    let localEntities;
    try {
      localEntities = window.localStorage.getItem(this.entity);
    } catch (e) {
      console.error('This browser does not support local storage');
    }
    if (localEntities) {
      this.entitiesSubject.next(JSON.parse(localEntities));
    }

    playerService.bind().subscribe(players => this.removeExcessCreatures(players));
  }

  get deleteCreatureEvent(): Observable<string> {
    return this.deleteCreatureEventSubject.asObservable();
  }

  bind(): Observable<Creature[]> {
    return Observable.combineLatest(
      super.bind(),
      this.playerService.bind(),
    ).map(([creatures, players]) => creatures.map((creature: Creature) => {
      creature.strength = this.getStrength(creature, players);
      return creature;
    }));
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
    (this.entitiesSubject.getValue() as Creature[])
      .filter(creature => !players.find(player => player.id === creature.ownerId))
      .forEach(creature => {
        this.delete(creature.id);
        this.deleteCreatureEventSubject.next(creature.id);
      });
  }
}
