import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Player } from '../models/player';
import { MAX_PLAYERS, PLAYER_SCORE_MODIFIER_TIMEOUT } from './../constants';
import { EntityService } from '@shared/services/entity.service';
import { localStorage } from '@shared/utils/localStorage';
import { ConqueringScore } from '@shared/models/conqueringScore';
import { arrayUtils } from '@shared/utils/arrayUtils';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class PlayerService extends EntityService {
  protected entity = 'players';

  private conqueringScores$ = new BehaviorSubject<ConqueringScore[]>([]);
  private playerPlaying$ = new BehaviorSubject<string>(null);
  private availableColors$: Observable<number[]>;

  constructor(
    private analyticsService: AnalyticsService
  ) {
    super();
    const players = localStorage.get<Player[]>(this.entity, localPlayers => localPlayers.filter(player => !!player).map(player => {
      if (player.playing) {
        this.playerPlaying$.next(player.id);
      }
      player.score = player.realScore;
      return player;
    }));

    this.updateFromLocalStorage(players);

    this.availableColors$ = this._bindAvailableColors().pipe(shareReplay(1));
  }

  bindFromId(id: string): Observable<Player> {
    return super.bindFromId(id).pipe(map(entity => entity as Player));
  }

  bindAllEntities(): Observable<Player[]> {
    return super.bindAllEntities().pipe(map(entities => entities as Player[]));
  }

  bindPlayerPlaying(): Observable<string> {
    return this.playerPlaying$.asObservable();
  }

  bindConqueringScores(playerId: string): Observable<ConqueringScore[]> {
    return this.conqueringScores$.pipe(map(conqueringScores => {
      return conqueringScores.filter(conqueringScore => conqueringScore.playerId === playerId);
    }));
  }

  bindAvailableColors(): Observable<number[]> {
    return this.availableColors$;
  }

  setPlayerPlaying(id: string): void {
    const playerPlaying = this.playerPlaying$.getValue();
    if (id !== playerPlaying) {
      this.edit(playerPlaying, (player: Player) => {
        player.playing = false;
        return player;
      });
      this.edit(id, (player: Player) => {
        player.playing = true;
        return player;
      });
      this.updateLocalStorage();
      this.playerPlaying$.next(id);
    }
  }

  nextPlayerPlaying(): void {
    const playersId = this.entityList$.getValue();
    const playerPlaying = this.playerPlaying$.getValue();
    if (playersId.length > 0) {
      const indexPlaying = playersId.findIndex(playerId => playerId === playerPlaying);
      this.setPlayerPlaying(playersId[indexPlaying + 1 < playersId.length ? indexPlaying + 1 : 0]);
    } else {
      this.playerPlaying$.next(null);
    }
  }

  add(newPlayer: Player): void {
    const players = this.entityList$.getValue();
    const playersLength = players.length;
    if (playersLength < MAX_PLAYERS) {
      this.analyticsService.addPlayer(newPlayer);
      super.add(newPlayer);
      if (playersLength === 0) {
        this.setPlayerPlaying(newPlayer.id);
      }
    }
  }

  delete(id: string): void {
    this.analyticsService.deletePlayer();
    super.delete(id);
    if (this.playerPlaying$.getValue() === id) {
      this.nextPlayerPlaying();
    }
  }

  changePlayerOrder(playerMovingId: string, newIndex: number) {
    const playerIdList = [...this.entityList$.getValue()];
    const indexOfMoving = playerIdList.findIndex(id => playerMovingId === id);
    playerIdList.splice(indexOfMoving, 1);
    playerIdList.splice(newIndex, 0, playerMovingId);
    this.entityList$.next(playerIdList);
    this.updateLocalStorage();
  }

  updateScore(modifier: number, id: string, fromConquest = false): void {
    if (modifier) {
      this.edit(id, (player: Player) => {
        player.realScore = player.realScore + modifier >= 0 ? player.realScore + modifier : 0;
        if (!fromConquest) {
          player.score = player.realScore;
          this.deleteConqueringScores(id);
        } else {
          this.addConqueringScore(id, modifier);
        }
        return player;
      });
    }
  }

  reset(): void {
    const playersId = this.entityList$.getValue();
    playersId.forEach(playerId => {
      this.deleteConqueringScores(playerId);
      this.edit(playerId, (player: Player) => {
        player.realScore = 0;
        player.score = 0;
        return player;
      });
    });
    this.updateLocalStorage();
  }

  private _bindAvailableColors(): Observable<number[]> {
    return this.bindAllEntities().pipe(map(players => {
      const takenColors = players.map(player => player.color);
      const allColors = arrayUtils.arrayOfInts(MAX_PLAYERS);
      return arrayUtils.diff(allColors, takenColors);
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

  private triggerConqueringScore(score: ConqueringScore, updateScore: boolean) {
    const conqueringScores = this.conqueringScores$.getValue();
    if (updateScore) {
      this.edit(score.playerId, (player: Player) => {
        player.score = player.score + score.score >= 0 ? player.score + score.score : 0;
        return player;
      });
    }
    if (score.timeout) {
      clearTimeout(score.timeout);
    }
    const index = conqueringScores.findIndex(scoreFromList => scoreFromList.id === score.id);
    conqueringScores.splice(index, 1);
    this.conqueringScores$.next(conqueringScores);
  }
}
