import { Component, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { combineLatest } from 'rxjs';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS, PLAYER_TYPE } from '../../constants';
import { Observable, Subscription } from 'rxjs';
import { ConqueringScore } from '@shared/models/conqueringScore';
import { DraggingService } from '@shared/services/dragging.service';
import { position } from '@shared/utils/position';
import { windowEvents } from '@shared/utils/windowEvents';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements AfterViewInit, OnDestroy {
  MAX_PLAYERS: number = MAX_PLAYERS;

  creatureDragging$ = this.draggingService.bindCreatureDragging();
  players$ = this.playerService.bindAllEntities();
  subscription = new Subscription();

  @Output('addPlayer') addPlayer = new EventEmitter<void>();
  @ViewChild('playerList') playerListElementRef: ElementRef;

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public draggingService: DraggingService,
  ) { }

  ngAfterViewInit() {
    this.subscription.add(combineLatest(
      windowEvents.portrait,
      this.playerService.bindList()
    ).subscribe(([, playersId]) => {
      setTimeout(() => {
        const htmlCollection = this.playerListElementRef.nativeElement.children;
        Array.from(htmlCollection)
          .filter((playerRef: HTMLElement) => Array.from(playerRef.classList).find(className => className === 'playerList__player'))
          .forEach((playerRef: HTMLElement, index) => {
            if (playersId && playersId[index]) {
              this.draggingService.registerCoordinates({
                itemId: playersId[index],
                x: position.pxToPercent(playerRef.getBoundingClientRect().left, 'x'),
                y: position.pxToPercent(playerRef.getBoundingClientRect().top, 'y'),
                width: position.pxToPercent(playerRef.clientWidth, 'x'),
                height: position.pxToPercent(playerRef.clientHeight, 'y'),
                type: PLAYER_TYPE
              });
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
