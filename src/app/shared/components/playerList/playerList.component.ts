import { Component, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS } from '../../constants';
import { Observable, Subscription } from 'rxjs';
import { ConqueringScore } from '@shared/models/conqueringScore';
import { DraggingService } from '@shared/services/dragging.service';
import { ItemCoordinates } from '@shared/interfaces/itemCoordinates';
import { position } from '@shared/utils/position';
import { windowEvents } from '@shared/utils/windowEvents';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements OnInit, AfterViewInit, OnDestroy {
  MAX_PLAYERS: number = MAX_PLAYERS;
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  players$ = this.playerService.bind();
  entitiesHovered: ItemCoordinates[] = [];
  subscription = new Subscription();

  @Output('addPlayer') addPlayer = new EventEmitter<void>();
  @ViewChild('playerList') playerListElementRef: ElementRef;

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public draggingService: DraggingService,
  ) { }

  ngOnInit() {
    this.subscription.add(this.draggingService.bindEntitiesHovered().subscribe(entities => this.entitiesHovered = entities));
  }

  ngAfterViewInit() {
    this.subscription.add(combineLatest(
      windowEvents.portrait,
      this.players$
    ).subscribe(([, players]) => {
      const htmlCollection = this.playerListElementRef.nativeElement.children;
      Array.from(htmlCollection).forEach((playerRef: HTMLElement, index) => {
        if (players && players[index]) {
          this.draggingService.registerCoordinates({
            itemId: players[index].id,
            x: position.pxToPercent(playerRef.getBoundingClientRect().left, 'x'),
            y: position.pxToPercent(playerRef.getBoundingClientRect().top, 'y'),
            width: playerRef.clientWidth,
            height: playerRef.clientHeight,
            type: 'player'
          });
        }
      });
    }));
  }

  isHovered(id: string) {
    const entity = this.entitiesHovered.find(entityHovered => entityHovered.itemId === id);
    return entity ? entity.hovered : false;
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
