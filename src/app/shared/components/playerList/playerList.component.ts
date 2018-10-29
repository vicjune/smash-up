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
import { Player } from '@shared/models/player';
import { ItemCoordinates } from '@shared/interfaces/itemCoordinates';

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

  playersCoordinates: ItemCoordinates[] = [];
  draggable = new Draggable();
  draggingPlayerId: {id: string, index: number} = {id: null, index: null};
  draggingPlayer$: Observable<Player>;

  @Output('addPlayer') addPlayer = new EventEmitter<void>();
  @ViewChild('playerList') playerListElementRef: ElementRef;

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public draggingService: DraggingService,
  ) { }

  ngOnInit() {
    this.subscription.add(this.draggable.clickEvent.subscribe(() => this.selectPlayer(this.draggingPlayerId.id)));
    this.subscription.add(this.draggable.draggingEvent.subscribe(coordinates => this.checkOrderChange(coordinates)));
    this.subscription.add(windowEvents.mouseUp.subscribe(() => this.draggingPlayerId = {id: null, index: null}));
  }

  ngAfterViewInit() {
    this.subscription.add(combineLatest(
      windowEvents.portrait,
      this.playerService.bindList()
    ).subscribe(([, playersId]) => {
      setTimeout(() => {
        this.playersCoordinates = Array.from(this.playerListElementRef.nativeElement.children)
          .filter((playerRef: HTMLElement) => Array.from(playerRef.classList).find(className => className === 'playerList__player'))
          .map((playerRef: HTMLElement, index) => (playersId && playersId[index] ? {
            itemId: playersId[index],
            x: position.pxToPercent(playerRef.getBoundingClientRect().left, 'x'),
            y: position.pxToPercent(playerRef.getBoundingClientRect().top, 'y'),
            width: position.pxToPercent(playerRef.offsetWidth, 'x'),
            height: position.pxToPercent(playerRef.offsetHeight, 'y'),
            type: PLAYER_TYPE
          } : null))
          .filter(coordinates => !!coordinates);

        this.playersCoordinates.forEach((coordinates) => {
          if (coordinates) {
            this.draggingService.registerCoordinates(coordinates);
          }
        });
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

  checkOrderChange(coordinates: [number, number]) {
    const movingCoordinates = {
      ...this.playersCoordinates[this.draggingPlayerId.index],
      x: coordinates[0],
      y: coordinates[1]
    };
    const itemsCoordinates = this.playersCoordinates.map(itemCoordinates => {
      const itemCoordinatesCloned = {...itemCoordinates};
      itemCoordinatesCloned.height += position.pxToPercent(20, 'y');
      return itemCoordinatesCloned;
    });
    const superposingId = position.getSuperposingId(movingCoordinates, itemsCoordinates, [this.draggingPlayerId.id]);
    if (superposingId) {
      this.playerService.changePlayerOrder(this.draggingPlayerId.id, superposingId.itemId);
    }
  }

  mouseDown(e: TouchEvent, playerId: string, index: number) {
    this.draggingPlayerId = {id: playerId, index};
    this.draggingPlayer$ = this.playerService.bindFromId(playerId);
    this.draggable.mouseDown(e);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.draggable.destroy();
  }
}
