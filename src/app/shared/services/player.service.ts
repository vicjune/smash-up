import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Player } from '../models/player';
import { MAX_PLAYERS } from './../constants';
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
      for (let index = 0; index < MAX_PLAYERS; index++) {
        if (players.map(playerFromList => playerFromList.color).indexOf(index) === -1) {
          player.color = index;
          break;
        }
      }
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

  updateScore(modifier: number, id: string): void {
    const players = this.entitiesSubject.getValue() as Player[];
    const playerIndex = players.map(player => player.id).indexOf(id);
    if (playerIndex !== -1 && players[playerIndex].score + modifier >= 0) {
      players[playerIndex].score = players[playerIndex].score + modifier;
    }
    this.update(players);
  }
}
