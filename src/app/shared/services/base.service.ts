import { Score } from './../models/base';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Player } from '@shared/models/player';
import { EntityService } from '@shared/services/entity.service';
import { Base } from '@shared/models/base';
import { MAX_PLAYERS } from '@shared/constants';
import { PlayerService } from '@shared/services/player.service';

@Injectable()
export class BaseService extends EntityService {
  protected entity = 'bases';

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
  }

  bind(): Observable<Base[]> {
    return this.playerService.bind().switchMap(players => super.bind().map((bases: Base[]) => bases.map(base => {
      base.scores = this.getScoresWithoutDeletedPlayers(base, players);
      base.resistance = this.getResistance(base);
      return base;
    })));
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
      return scoreB.totalScore - scoreA.totalScore;
    }).map((score, index, array) => {
      let reward = 0;
      if (index === 0) {
        reward = base.rewards[index];
      } else if (index < 3) {
        if (score.totalScore === array[index - 1].totalScore) {
          reward = base.rewards[index - 1];

          if (index === 2 && score.totalScore === array[index - 2].totalScore) {
            reward = base.rewards[index - 2];
          }
        } else {
          reward = base.rewards[index];
        }
      }

      return {
        id: score.playerId,
        score: score.totalScore,
        reward: reward
      };
    });

    sortedScores.forEach(score => {
      this.playerService.updateScore(score.reward, score.id, true);
    });

    this.delete(base.id);
  }

  private getResistance(base: Base): number {
    const resistance = base.maxResistance - base.scores.map(score => score.totalScore).reduce((a, b) => a + b, 0);
    if (resistance < 0) {
      return 0;
    }
    return resistance;
  }

  private getScoresWithoutDeletedPlayers(base: Base, players: Player[]): Score[] {
    const playerIds = players.map(player => player.id);
    const basePlayerIds = base.scores.map(score => score.playerId);
    const playerSurplusIds = this.arrayDiff(basePlayerIds, playerIds);

    if (playerSurplusIds.length > 0) {
      for (const playerSurplusId of playerSurplusIds) {
        base.scores.splice(base.scores.map(score => score.playerId).indexOf(playerSurplusId), 1);
      }
    }

    return base.scores.map(score => {
      if ((this.get(score.playerId, players).entity as Player).playing) {
        score.totalScore = score.score + score.scoreModifier;
      } else {
        score.totalScore = score.score;
      }

      if (score.totalScore < 0) {
        score.totalScore = 0;
      }

      return score;
    });
  }
}
