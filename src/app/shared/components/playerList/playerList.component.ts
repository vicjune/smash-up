import { Component, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {  Observable, Subscription, combineLatest } from 'rxjs';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS, PLAYER_TYPE } from '../../constants';
import { ConqueringScore } from '@shared/models/conqueringScore';
import { DraggingService } from '@shared/services/dragging.service';
import { position } from '@shared/utils/position';
import { windowEvents } from '@shared/utils/windowEvents';
import { Draggable } from '@shared/utils/draggable';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements OnInit, AfterViewInit, OnDestroy {
  MAX_PLAYERS: number = MAX_PLAYERS;

  creatureDragging$ = this.draggingService.bindCreatureDragging();
  players$ = this.playerService.bindAllEntities();
  subscription = new Subscription();

  playerSizes: [number, number][] = [];
  draggable = new Draggable();
  draggingPlayer: string = null;

  @Output('addPlayer') addPlayer = new EventEmitter<void>();
  @ViewChild('playerList') playerListElementRef: ElementRef;

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public draggingService: DraggingService,
  ) { }

  ngOnInit() {
    this.subscription.add(this.draggable.clickEvent.subscribe(() => this.selectPlayer(this.draggingPlayer)));
    this.subscription.add(windowEvents.mouseUp.subscribe(() => this.draggingPlayer = null));
  }

  ngAfterViewInit() {
    this.subscription.add(combineLatest(
      windowEvents.portrait,
      this.playerService.bindList()
    ).subscribe(([, playersId]) => {
      setTimeout(() => {
        const domPlayerList = Array.from(this.playerListElementRef.nativeElement.children)
          .filter((playerRef: HTMLElement) => Array.from(playerRef.classList).find(className => className === 'playerList__player'));

        domPlayerList.forEach((playerRef: HTMLElement, index) => {
          if (playersId && playersId[index]) {
            this.draggingService.registerCoordinates({
              itemId: playersId[index],
              x: position.pxToPercent(playerRef.getBoundingClientRect().left, 'x'),
              y: position.pxToPercent(playerRef.getBoundingClientRect().top, 'y'),
              width: position.pxToPercent(playerRef.offsetWidth, 'x'),
              height: position.pxToPercent(playerRef.offsetHeight, 'y'),
              type: PLAYER_TYPE
            });
          }
        });

        this.playerSizes = domPlayerList.map((playerRef: HTMLElement) => ([playerRef.offsetWidth, playerRef.offsetHeight] as [number, number]));
      });
    }));
  }

  isHovered(id: string): Observable<boolean> {
    return this.draggingService.bindIsHovered(id);
  }

  getConqueringScores$(playerId: string): Observable<ConqueringScore[]> {
    return this.playerService.bindConqueringScores(playerId);
  }

  addPlayerClicked() {
    this.addPlayer.emit();
  }

  selectPlayer(id) {
    this.playerService.setPlayerPlaying(id);
  }

  increaseScore(id, e) {
    e.preventDefault();
    this.playerService.updateScore(1, id);
  }

  decreaseScore(id, e) {
    e.preventDefault();
    this.playerService.updateScore(-1, id);
  }

  mouseDown(e: TouchEvent, playerId: string) {
    this.draggable.mouseDown(e);
    this.draggingPlayer = playerId;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.draggable.destroy();
  }
}
