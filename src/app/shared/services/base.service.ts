import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Player } from '@shared/models/player';
import { EntityService } from '@shared/services/entity.service';
import { Base, Score } from '@shared/models/base';
import { MAX_PLAYERS } from '@shared/constants';
import { PlayerService } from '@shared/services/player.service';
import { CreatureService } from '@shared/services/creature.service';
import { Creature } from '@shared/models/creature';

@Injectable()
export class BaseService extends EntityService {
  protected entity = 'bases';

  constructor(
    private playerService: PlayerService,
    private creatureService: CreatureService
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

    this.creatureService.addCreatureSubject.subscribe(({creatureId, baseId}) => this.addCreature(creatureId, baseId));
    this.creatureService.moveCreatureSubject.subscribe(({creatureId, baseId}) => this.moveCreatureToAnotherBase(creatureId, baseId));
    this.creatureService.deleteCreatureSubject.subscribe(({creatureId}) => this.removeCreature(creatureId));
  }

  bind(): Observable<Base[]> {
    return Observable.combineLatest(
      super.bind(),
      this.playerService.bind(),
      this.creatureService.bind()
    ).map(([bases, players, creatures]) => bases.map((base: Base) => {
      base.scores = this.getScores(base, players, creatures);
      base.resistance = this.getResistance(base);
      return base;
    }));
  }

  add(base: Base): void {
    const bases = this.entitiesSubject.getValue();
    if (bases.length < MAX_PLAYERS + 1) {
      base.color = this.getNewColor();
      super.add(base);
    }
  }

  conquer(base: Base): void {
    const sortedScores = base.scores.sort((scoreA, scoreB) => {
      return scoreB.score - scoreA.score;
    }).map((score, index, array) => {
      let reward = 0;
      if (index === 0) {
        reward = base.rewards[index];
      } else if (index < 3) {
        if (score.score === array[index - 1].score) {
          reward = base.rewards[index - 1];

          if (index === 2 && score.score === array[index - 2].score) {
            reward = base.rewards[index - 2];
          }
        } else {
          reward = base.rewards[index];
        }
      }

      return {
        ...score,
        reward
      };
    });

    sortedScores.forEach(score => {
      this.playerService.updateScore(score.reward, score.playerId, true);
    });

    this.delete(base.id);
  }

  private addCreature(creatureId, baseId: string) {
    const base = this.get(baseId, this.entitiesSubject.getValue()).entity as Base;
    base.creatures.push(creatureId);
    this.edit(base);
  }

  private removeCreature(creatureId: string) {
    for (const base of this.entitiesSubject.getValue() as Base[]) {
      const creatureIndex = base.creatures.findIndex(baseCreatureId => baseCreatureId === creatureId);
      if (creatureIndex !== -1) {
        base.creatures.splice(creatureIndex, 1);
        this.edit(base);
        break;
      }
    }
  }

  private moveCreatureToAnotherBase(creatureId: string, newBaseId: string) {
    this.removeCreature(creatureId);
    this.addCreature(creatureId, newBaseId);
  }

  private getResistance(base: Base): number {
    const resistance = base.maxResistance - base.scores.map(score => score.score).reduce((a, b) => a + b, 0);
    return resistance;
  }

  private getScores(base: Base, players: Player[], creatures: Creature[]): Score[] {
    return players.map(player => {
      const creaturesOfThisPlayer = base.creatures
        .map(creatureId => creatures.find(creature => creature.id === creatureId))
        .filter(creature => creature && creature.ownerId === player.id);

      let score = null;
      if (creaturesOfThisPlayer.length > 0) {
        score = creaturesOfThisPlayer
          .reduce((previousScore, creature) => previousScore + creature.strength, 0);
      }

      return {
        playerId: player.id,
        score
      };
    }).filter(score => score.score >= 0);
  }
}
