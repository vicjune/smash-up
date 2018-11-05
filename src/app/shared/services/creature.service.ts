import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { EntityService } from '@shared/services/entity.service';
import { PlayerService } from '@shared/services/player.service';
import { Creature } from '@shared/models/creature';
import { Player } from '@shared/models/player';
import { localStorage } from '@shared/utils/localStorage';
import { MONSTER_OWNER_ID } from '@shared/constants';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class CreatureService extends EntityService {
  protected entity = 'creatures';

  private deleteCreatureEvent$ = new Subject<string>();
  private deleteCreatureFromDragEvent$ = new Subject<void>();

  constructor(
    private playerService: PlayerService,
    private analyticsService: AnalyticsService
  ) {
    super();
    const creatures = localStorage.get<Creature[]>(this.entity);
    this.updateFromLocalStorage(creatures);

    playerService.bindList().subscribe(playersId => this.removeExcessCreatures(playersId));
  }

  get deleteCreatureEvent(): Observable<string> {
    return this.deleteCreatureEvent$.asObservable();
  }

  get deleteCreatureFromDragEvent(): Observable<void> {
    return this.deleteCreatureFromDragEvent$.asObservable();
  }

  bindFromId(id): Observable<Creature> {
    return super.bindFromId(id).pipe(
      switchMap((creature: Creature) => {
        if (!creature) {
          return of(creature);
        }
        return this.playerService.bindFromId(creature.ownerId).pipe(
          map(owner => {
            creature.strength = this.getStrength(creature, owner);
            return creature;
          })
        );
      })
    );
  }

  bindAllEntities(): Observable<Creature[]> {
    return super.bindAllEntities().pipe(map(creatures => creatures as Creature[]));
  }

  delete(creatureId: string, exitDetailMode = false) {
    this.deleteCreatureEvent$.next(creatureId);
    if (exitDetailMode) {
      this.deleteCreatureFromDragEvent$.next();
    }
    super.delete(creatureId);
  }

  private getStrength(creature: Creature, owner: Player): number {
    let strength = creature.basicStrength + creature.bonusStrength;
    if (owner && owner.playing) {
      strength += creature.modifierDuringOwnerTurn;
    }
    return strength > 0 ? strength : 0;
  }

  private removeExcessCreatures(playersId: string[]) {
    const creatures = this.getAllEntities() as Creature[];
    let i = creatures.length;
    while (i--) {
      if (creatures[i].ownerId !== MONSTER_OWNER_ID && !playersId.find(playerId => playerId === creatures[i].ownerId)) {
        this.delete(creatures[i].id);
      }
    }
  }
}
