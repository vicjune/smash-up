import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Player } from '../models/player';
import { MAX_PLAYERS, PLAYER_SCORE_MODIFIER_TIMEOUT } from './../constants';
import { EntityService } from '@shared/services/entity.service';

@Injectable()
export class PlayerService extends EntityService {
  protected entity = 'players';

  constructor() {
    super();

    let localEntities;
    try {
      localEntities = window.localStorage.getItem(this.entity);
    } catch (e) {
      console.error('This browser does not support local storage');
    }
    if (localEntities) {
      let players = JSON.parse(localEntities) as Player[];
      players = players.map(player => {
        if (player.scoreModifier !== 0) {
          if (player.score + player.scoreModifier >= 0) {
            player.score = player.score + player.scoreModifier;
          } else {
            player.score = 0;
          }
          player.scoreModifier = 0;
          player.scoreModifierDisplay = false;
        }
        return player;
      });
      this.entitiesSubject.next(players);
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

  setPlayerPlaying(id: string): void {
    const players = this.entitiesSubject.getValue() as Player[];
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
    const players = this.entitiesSubject.getValue() as Player[];
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
    const players = this.entitiesSubject.getValue() as Player[];
    if (players.length < MAX_PLAYERS) {
      player.color = this.getNewColor();
      if (players.length === 0) {
        player.playing = true;
      }
      super.add(player);
    }
  }

  delete(id: string): void {
    const players = this.entitiesSubject.getValue() as Player[];
    if (this.get(id, players).entity) {
      const playing = (this.get(id, players).entity as Player).playing;
      super.delete(id);
      if (players[0] && !players[0].playing) {
        players[0].playing = playing;
      }
    }
    this.update(players);
  }

  updateScore(modifier: number, id: string, fromConquest = false): void {
    const players = this.entitiesSubject.getValue() as Player[];
    const player = this.get(id, players).entity as Player;
    if (player) {
      if (!fromConquest) {
        if (player.score + modifier >= 0) {
          players[this.get(id, players).index].score = player.score + modifier;
        } else {
          players[this.get(id, players).index].score = 0;
        }
      } else {
        players[this.get(id, players).index].scoreModifier = modifier;
        players[this.get(id, players).index].scoreModifierDisplay = true;
        setTimeout(() => {
          players[this.get(id, players).index].scoreModifierDisplay = false;
          this.update(players);
        }, PLAYER_SCORE_MODIFIER_TIMEOUT - 300);
        setTimeout(() => {
          players[this.get(id, players).index].scoreModifier = 0;
          if (player.score + modifier >= 0) {
            players[this.get(id, players).index].score = player.score + modifier;
          } else {
            players[this.get(id, players).index].score = 0;
          }
          this.update(players);
        }, PLAYER_SCORE_MODIFIER_TIMEOUT);
      }
    }
    this.update(players);
  }

  reset(): void {
    const players = this.entitiesSubject.getValue() as Player[];
    this.update(players.map(player => {
      player.score = 0;
      return player;
    }));
  }
}
