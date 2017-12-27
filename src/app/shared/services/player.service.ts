import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { Player } from '../models/player';
import { MAX_PLAYERS } from './../constants';

@Injectable()
export class PlayerService {
  private playersSubject: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

  constructor() {
    const localPlayers = window.localStorage.getItem('players');
    if (localPlayers) {
      this.playersSubject.next(JSON.parse(localPlayers));
    }
  }

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
    this.updatePlayers(players);
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
      if (players.length === 0) {
        player.playing = true;
      }
      players.push(player);
      this.updatePlayers(players);
    }
  }

  removePlayer(id: string): void {
    const players = this.playersSubject.getValue();
    const playerIndex = players.map(player => player.id).indexOf(id);
    if (playerIndex !== -1) {
      const playing = players[playerIndex].playing;
      players.splice(playerIndex, 1);
      if (players[0]) {
        players[0].playing = playing;
      }
    }
    this.updatePlayers(players);
  }

  updateScore(modifier: number, id: string): void {
    const players = this.playersSubject.getValue();
    const playerIndex = players.map(player => player.id).indexOf(id);
    if (playerIndex !== -1 && players[playerIndex].score + modifier >= 0) {
      players[playerIndex].score = players[playerIndex].score + modifier;
    }
    this.updatePlayers(players);
  }

  resetGame(): void {
    this.updatePlayers([]);
  }

  private updatePlayers(players: Player[]): void {
    window.localStorage.setItem('players', JSON.stringify(players));
    this.playersSubject.next(players);
  }
}
