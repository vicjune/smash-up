import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { EntityService } from '@shared/services/entity.service';
import { PlayerService } from '@shared/services/player.service';
import { Creature } from '@shared/models/creature';
import { BaseService } from '@shared/services/base.service';

@Injectable()
export class CreatureService extends EntityService {
  protected entity = 'creatures';

  constructor(
    private playerService: PlayerService,
    private baseService: BaseService
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
  }

  bind(): Observable<Creature[]> {
    return super.bind().map(entities => entities.map(entity => entity as Creature));
  }

  add(creature: Creature, baseId: string) {
    super.add(creature);
    this.baseService.addCreature(creature.id, baseId);
  }

  swichOwner(creature: Creature, newOwnerId: string) {
    creature.ownerId = newOwnerId;
    this.edit(creature);
  }

  moveToAnotherBase(creature: Creature, newBaseId: string) {
    this.baseService.moveCreatureToAnotherBase(creature.id, newBaseId);
  }

  delete(creatureId: string): void {
    super.delete(creatureId);
    this.baseService.removeCreature(creatureId);
  }
}
