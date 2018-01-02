import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Player } from '../models/player';
import { MAX_PLAYERS, PLAYER_SCORE_MODIFIER_TIMEOUT } from './../constants';
import { EntityService } from '@shared/services/entity.service';

@Injectable()
export class PlayerService extends EntityService {
  protected entity = 'players';

  constructor() {
    super();
    const localPlayers = window.localStorage.getItem(this.entity);
    if (localPlayers) {
      this.entitiesSubject.next(JSON.parse(localPlayers));
    }
  }

  bind(): Observable<Player[]> {
    return super.bind().map(entities => entities.map(entity => entity as Player));
  }

  bindPlayerPlaying(): Observable<Player> {
    return this.bind().map(players => {
      for (const player of players) {
        const play = player as Player;
        if (play.playing) {
          return play;
        }
      }
      return null;
    });
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
    const players = this.entitiesSubject.getValue() as Player[];
    const player = this.get(id).entity as Player;
    if (player) {
      if (!fromConquest) {
        if (player.score + modifier >= 0) {
          players[this.get(id).index].score = player.score + modifier;
        } else {
          players[this.get(id).index].score = 0;
        }
      } else {
        players[this.get(id).index].scoreModifier = modifier;
        players[this.get(id).index].scoreModifierDisplay = true;
        setTimeout(() => {
          players[this.get(id).index].scoreModifierDisplay = false;
          this.update(players);
        }, PLAYER_SCORE_MODIFIER_TIMEOUT - 300);
        setTimeout(() => {
          players[this.get(id).index].scoreModifier = 0;
          if (player.score + modifier >= 0) {
            players[this.get(id).index].score = player.score + modifier;
          } else {
            players[this.get(id).index].score = 0;
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
