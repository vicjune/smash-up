import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

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
    const localEntities = window.localStorage.getItem(this.entity);
    if (localEntities) {
      this.entitiesSubject.next(JSON.parse(localEntities));
    }

    this.playerService.bind().subscribe(players => {
      this.updateScores(players);
    });
  }

  add(base: Base): void {
    const bases = this.entitiesSubject.getValue();
    if (bases.length < MAX_PLAYERS + 1) {
      super.add(base);
    }
  }

  conquer(base: Base): void {
    const sortedScores = base.scores.map(score => {
      return {
        playerId: score.playerId,
        totalScore: score.score + score.scoreModifier
      };
    }).sort((scoreA, scoreB) => {
      return scoreA.totalScore - scoreB.totalScore;
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
      this.playerService.updateScore(score.reward, score.id);
    });
  }

  private updateScores(players): void {
    const bases = this.entitiesSubject.getValue() as Base[];
    const playerIds = players.map(player => player.id);

    for (const base of bases) {
      const basePlayerIds = base.scores.map(score => score.playerId);
      // const playerMissingIds = this.arrayDiff(playerIds, basePlayerIds);
      const playerSurplusIds = this.arrayDiff(basePlayerIds, playerIds);

      // if (playerMissingIds.length > 0) {
      //   for (const playerMissingId of playerMissingIds) {
      //     base.scores.push({
      //       playerId: playerMissingId,
      //       score: 0,
      //       scoreModifier: 0
      //     });
      //   }
      // }

      if (playerSurplusIds.length > 0) {
        for (const playerSurplusId of playerSurplusIds) {
          base.scores.splice(base.scores.map(score => score.playerId).indexOf(playerSurplusId), 1);
        }
      }

      this.edit(base);
    }
  }
}
