import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Player } from '../models/player';
import { MAX_PLAYERS, PLAYER_SCORE_MODIFIER_TIMEOUT } from './../constants';
import { EntityService } from '@shared/services/entity.service';
import { localStorage } from '@shared/utils/localStorage';
import { ConqueringScore } from '@shared/models/conqueringScore';

@Injectable()
export class PlayerService extends EntityService {
  protected entity = 'players';
  private conqueringScores$ = new BehaviorSubject<ConqueringScore[]>([]);

  constructor() {
    super();
    const players = localStorage.get<Player[]>(this.entity, localPlayers => localPlayers.map(player => {
      player.score = player.realScore;
      return player;
    }));

    if (players) {
      this.entities$.next(players);
    }
  }

  bind(): Observable<Player[]> {
    return super.bind().pipe(map(entities => entities.map(entity => entity as Player)));
  }

  bindPlayer(id: string): Observable<Player> {
    return this.bind().pipe(map(players => {
      const index = players.map(player => player.id).indexOf(id);
      if (index !== -1) {
        return players[index];
      }
      return null;
    }));
  }

  bindPlayerPlaying(): Observable<Player> {
    return this.bind().pipe(map(players => {
      for (const player of players) {
        const play = player as Player;
        if (play.playing) {
          return play;
        }
      }
      return null;
    }));
  }

  bindConqueringScores(playerId: string): Observable<ConqueringScore[]> {
    return this.conqueringScores$.pipe(map(conqueringScores => {
      return conqueringScores.filter(conqueringScore => conqueringScore.playerId === playerId);
    }));
  }

  setPlayerPlaying(id: string): void {
    const players = this.entities$.getValue() as Player[];
    for (const player of players) {
      if (player.id === id) {
        player.playing = true;
      } else {
        player.playing = false;
      }
    }
    this.update(players);
  }

  nextPlayerPlaying(): void {
    const players = this.entities$.getValue() as Player[];
    if (players.length > 1) {
      let previousPlaying = false;
      for (const player of players) {
        if (previousPlaying) {
          this.setPlayerPlaying(player.id);
          previousPlaying = false;
          break;
        }
        if (player.playing) {
          previousPlaying = true;
        }
      }

      if (previousPlaying) {
        this.setPlayerPlaying(players[0].id);
      }
    }
  }

  add(player: Player): void {
    const players = this.entities$.getValue() as Player[];
    if (players.length < MAX_PLAYERS) {
      player.color = this.getNewColor();
      if (players.length === 0) {
        player.playing = true;
      }
      super.add(player);
    }
  }

  delete(id: string): void {
    const players = this.entities$.getValue() as Player[];
    this.deleteConqueringScores(id);
    if (this.get(id).entity) {
      const playing = (this.get(id).entity as Player).playing;
      super.delete(id);
      if (players[0] && !players[0].playing) {
        players[0].playing = playing;
      }
    }
    this.update(players);
  }

  updateScore(modifier: number, id: string, fromConquest = false): void {
    if (modifier) {
      const player = this.get(id).entity as Player;
      if (player) {
        player.realScore = player.realScore + modifier >= 0 ? player.realScore + modifier : 0;
        if (!fromConquest) {
          player.score = player.realScore;
          this.deleteConqueringScores(id);
        } else {
          this.addConqueringScore(id, modifier);
        }
        this.edit(player);
      }
    }
  }

  reset(): void {
    const players = this.entities$.getValue() as Player[];
    this.update(players.map(player => {
      this.deleteConqueringScores(player.id);
      player.realScore = 0;
      player.score = 0;
      return player;
    }));
  }

  private addConqueringScore(playerId: string, score: number) {
    const conqueringScores = this.conqueringScores$.getValue();
    const newConqueringScore = new ConqueringScore(playerId, score);
    newConqueringScore.timeout = setTimeout(() => {
      this.triggerConqueringScore(newConqueringScore, true);
    }, PLAYER_SCORE_MODIFIER_TIMEOUT);
    conqueringScores.push(newConqueringScore);
    this.conqueringScores$.next(conqueringScores);
  }

  private deleteConqueringScores(playerId: string) {
    const conqueringScores = this.conqueringScores$.getValue();
    let i = conqueringScores.length;
    while (i--) {
      if (conqueringScores[i].playerId === playerId) {
        this.triggerConqueringScore(conqueringScores[i], false);
      }
    }
  }

  private triggerConqueringScore(score: ConqueringScore, updateScore) {
    const conqueringScores = this.conqueringScores$.getValue();
    if (updateScore) {
      this.editById(score.playerId, (player: Player) => {
        player.score = player.score + score.score >= 0 ? player.score + score.score : 0;
        return player;
      });
    }
    if (score.timeout) {
      clearTimeout(score.timeout);
    }
    const index = conqueringScores.findIndex(conqueringScore => conqueringScore.id === score.id);
    conqueringScores.splice(index, 1);
    this.conqueringScores$.next(conqueringScores);
  }
}
