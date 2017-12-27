import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Player } from '../models/player';
import { MAX_PLAYERS } from './../constants';

@Injectable()
export class PlayerService {
  private playersSubject: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

  constructor() { }

  bindPlayers(): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  bindPlayerPlaying(): Observable<Player> {
    return this.bindPlayers().map(players => {
      for (const player of players) {
        if (player.playing) {
          return player;
        }
      }
      return null;
    });
  }

  setPlayerPlaying(id: string): void {
    const players = this.playersSubject.getValue();
    for (const player of players) {
      if (player.id === id) {
        player.playing = true;
      } else {
        player.playing = false;
      }
    }
  }

  addPlayer(player: Player): void {
    const players = this.playersSubject.getValue();
    if (players.length < MAX_PLAYERS) {
      for (let index = 0; index < MAX_PLAYERS; index++) {
        if (players.map(playerFromList => playerFromList.color).indexOf(index) === -1) {
          player.color = index;
          break;
        }
      }
      players.push(player);
      this.playersSubject.next(players);
    }
  }

  removePlayer(id: string): void {
    const players = this.playersSubject.getValue();
    const playerIndex = players.map(player => player.id).indexOf(id);
    if (playerIndex !== -1) {
      players.splice(playerIndex, 1);
    }
    this.playersSubject.next(players);
  }
}
