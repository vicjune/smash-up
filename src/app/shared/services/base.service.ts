import { Injectable } from '@angular/core';
import { Observable, combineLatest, Subject, of } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

import { EntityService } from '@shared/services/entity.service';
import { Base } from '@shared/models/base';
import { MAX_BASES, MONSTER_OWNER_ID } from '@shared/constants';
import { PlayerService } from '@shared/services/player.service';
import { CreatureService } from '@shared/services/creature.service';
import { Creature } from '@shared/models/creature';
import { Score } from '@shared/interfaces/score';
import { localStorage } from '@shared/utils/localStorage';
import { CreatureOrderedList } from '@shared/interfaces/creatureOrderedList';
import { arrayUtils } from '@shared/utils/arrayUtils';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class BaseService extends EntityService {
  protected entity = 'bases';

  private creatureMovedEvent$ = new Subject<void>();
  private creatureDeletedEvent$ = new Subject<void>();
  private availableColors$: Observable<number[]>;

  constructor(
    private playerService: PlayerService,
    private creatureService: CreatureService,
    private analyticsService: AnalyticsService,
  ) {
    super();
    const bases = localStorage.get<Base[]>(this.entity);
    this.updateFromLocalStorage(bases);

    this.availableColors$ = this._bindAvailableColors().pipe(shareReplay(1));

    this.creatureService.deleteCreatureEvent.subscribe(creatureId => this.removeCreature(creatureId));
  }

  bindFromId(id: string): Observable<Base> {
    return combineLatest(
      super.bindFromId(id),
      this.playerService.bindList(),
    ).pipe(
      switchMap(([base, playersId]: [Base, string[]]) => {
        return this.bindCreaturesOnThisBase(base).pipe(
          map(creaturesOnThisBase => {
            base.scores = this.getScores(playersId, creaturesOnThisBase);
            base.resistance = this.getResistance(base, creaturesOnThisBase);
            return base;
          })
        );
      })
    );
  }

  bindAllEntities(): Observable<Base[]> {
    return super.bindAllEntities().pipe(map(bases => bases as Base[]));
  }

  bindCreatureMovedEvent(): Observable<void> {
    return this.creatureMovedEvent$.asObservable();
  }

  bindCreatureDeletedEvent(): Observable<void> {
    return this.creatureDeletedEvent$.asObservable();
  }

  bindAvailableColors(): Observable<number[]> {
    return this.availableColors$;
  }

  bindCreatureOrderedList(baseId: string): Observable<CreatureOrderedList> {
    return combineLatest(
      this.bindFromId(baseId).pipe(
        switchMap(base => this.bindCreaturesOnThisBase(base))
      ),
      this.playerService.bindAllEntities()
    ).pipe(
      map(([creaturesOnThisBase, players]) => {
        const monsters = creaturesOnThisBase
          .filter(creature => creature.ownerId === MONSTER_OWNER_ID)
          .map(monster => monster.id);

        const creatureOwners = players.map(player => {
          const creaturesFromThisOwner = creaturesOnThisBase
            .filter(creature => creature.ownerId === player.id)
            .map(creature => creature.id);
          return {
            creatures: creaturesFromThisOwner,
            player
          };
        }).filter(creatureOwner => creatureOwner && creatureOwner.creatures && creatureOwner.creatures.length > 0);

        return {players: creatureOwners, monsters};
      })
    );
  }

  add(newBase: Base): void {
    const bases = this.entityList$.getValue();
    if (bases.length < MAX_BASES) {
      this.analyticsService.addBase();
      newBase.color = arrayUtils.getNewIndex(this.getAllEntities().map((base: Base) => base.color));
      super.add(newBase);
    }
  }

  conquer(baseId: string): void {
    const base = this.getEntity(baseId) as Base;

    const sortedScores = base.scores.sort((scoreA, scoreB) => {
      return scoreB.score - scoreA.score;
    });

    let rewardIndex = 0;
    let scoreIndex = 0;
    while (rewardIndex < base.rewards.length && scoreIndex < sortedScores.length) {
      const basisScore = sortedScores[scoreIndex];
      basisScore.reward = base.rewards[rewardIndex];
      scoreIndex ++;

      while (scoreIndex < sortedScores.length) {
        if (sortedScores[scoreIndex].score === basisScore.score) {
          sortedScores[scoreIndex].reward = base.rewards[rewardIndex];
          scoreIndex ++;
        } else {
          rewardIndex = scoreIndex;
          break;
        }
      }
    }

    sortedScores.forEach(score => {
      this.playerService.updateScore(score.reward, score.playerId, true);
    });

    this.analyticsService.conquerBase();
    this.delete(base.id, true);
  }

  delete(baseId: string, conquest = false) {
    const base = this.getEntity(baseId) as Base;
    let i = base.creatures.length;
    while (i--) {
      this.creatureService.delete(base.creatures[i]);
    }
    if (!conquest) {
      this.analyticsService.deleteBase();
    }
    super.delete(baseId);
  }

  createCreature(creature: Creature, baseId: string) {
    this.creatureService.add(creature);
    this.addCreature(creature.id, baseId);
  }


  moveCreatureToAnotherBase(creatureId: string, newBaseId: string) {
    this.creatureMovedEvent$.next();
    this.removeCreature(creatureId);
    this.addCreature(creatureId, newBaseId);
  }

  private _bindAvailableColors(): Observable<number[]> {
    return this.bindAllEntities().pipe(map(bases => {
      const takenColors = bases.map(base => base.color);
      const allColors = arrayUtils.arrayOfInts(MAX_BASES);
      return arrayUtils.diff(allColors, takenColors);
    }));
  }

  private bindCreaturesOnThisBase(base: Base): Observable<Creature[]> {
    if (base.creatures.length === 0) {
      return of([]);
    }
    return combineLatest(...base.creatures.map(creatureId => this.creatureService.bindFromId(creatureId)));
  }

  private addCreature(creatureId: string, baseId: string) {
    this.edit(baseId, (base: Base) => {
      base.creatures.push(creatureId);
      return base;
    });
  }

  private removeCreature(creatureId: string) {
    this.creatureDeletedEvent$.next();
    for (const base of this.getAllEntities() as Base[]) {
      const creatureIndex = base.creatures.findIndex(baseCreatureId => baseCreatureId === creatureId);
      if (creatureIndex !== -1) {
        this.edit(base.id, (thisBase: Base) => {
          thisBase.creatures.splice(creatureIndex, 1);
          return thisBase;
        });
        break;
      }
    }
  }

  private getResistance(base: Base, creaturesOnThisBase: Creature[]): number {
    let resistance = base.maxResistance - base.scores.map(score => score.score).reduce((previous, score) => previous + score, 0);

    // add monsters strength to the base resistance
    resistance += creaturesOnThisBase
      .filter(creature => creature && creature.ownerId === MONSTER_OWNER_ID)
      .reduce((previous, monster) => previous + monster.strength, 0);

    return resistance;
  }

  private getScores(playersId: string[], creaturesOnThisBase: Creature[]): Score[] {
    return playersId.map(playerId => {
      const creaturesOfThisPlayer = creaturesOnThisBase.filter(creature => creature && creature.ownerId === playerId);

      let score = null;
      if (creaturesOfThisPlayer.length > 0) {
        score = creaturesOfThisPlayer
          .reduce((previousScore, creature) => previousScore + creature.strength, 0);
      }

      return {
        playerId: playerId,
        score
      };
    }).filter(score => score.score !== null);
  }
}
