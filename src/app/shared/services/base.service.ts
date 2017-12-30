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

  private updateScores(players): void {
    const bases = this.entitiesSubject.getValue() as Base[];
    const playerIds = players.map(player => player.id);

    for (const base of bases) {
      const basePlayerIds = base.scores.map(score => score.playerId);
      const playerMissingIds = this.arrayDiff(playerIds, basePlayerIds);
      const playerSurplusIds = this.arrayDiff(basePlayerIds, playerIds);

      if (playerMissingIds.length > 0) {
        for (const playerMissingId of playerMissingIds) {
          base.scores.push({
            playerId: playerMissingId,
            score: 0,
            scoreModifier: 0
          });
        }
      }

      if (playerSurplusIds.length > 0) {
        for (const playerSurplusId of playerSurplusIds) {
          base.scores.splice(base.scores.map(score => score.playerId).indexOf(playerSurplusId), 1);
        }
      }

      this.edit(base);
    }
  }
}
