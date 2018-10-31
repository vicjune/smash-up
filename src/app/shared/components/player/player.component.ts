import { Component, AfterViewInit, OnDestroy, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';

import { PlayerService } from '@shared/services/player.service';
import { Player } from '@shared/models/player';
import { Draggable } from '@shared/utils/draggable';
import { DraggingService } from '@shared/services/dragging.service';
import { ConqueringScore } from '@shared/models/conqueringScore';
import { windowEvents } from '@shared/utils/windowEvents';
import { PLAYER_TYPE } from '@shared/constants';
import { position } from '@shared/utils/position';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() playerId: string;
  @Input() otherDraggable: Draggable;
  @Input() forcedSize: [number, number];
  @ViewChild('player') playerElementRef: ElementRef;

  player$: Observable<Player>;
  conqueringScores$: Observable<ConqueringScore[]>;
  isHovered$: Observable<boolean>;
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  draggable: Draggable;

  subscription = new Subscription();

  constructor(
    public playerService: PlayerService,
    public draggingService: DraggingService
  ) { }

  ngOnInit() {
    this.draggable = this.otherDraggable || new Draggable();

    this.player$ = this.playerService.bindFromId(this.playerId);
    this.conqueringScores$ = this.playerService.bindConqueringScores(this.playerId);
    this.isHovered$ = this.draggingService.bindIsHoveredByCreature(this.playerId);

    this.subscription.add(this.draggable.clickEvent.subscribe(() => {
      this.selectPlayer();
      this.triggerDrop();
    }));
    this.subscription.add(this.draggable.draggingEvent.subscribe(coordinates => this.sendDraggingCoordinates(coordinates)));
    this.subscription.add(this.draggable.dropEvent.subscribe(() => this.triggerDrop()));
  }

  ngAfterViewInit() {
    if (!this.otherDraggable) {
      this.subscription.add(combineLatest(
        this.playerService.bindList(),
        windowEvents.portrait
      ).subscribe(() => {
        setTimeout(() => {
          if (this.playerElementRef) {
            this.draggingService.registerCoordinates({
              itemId: this.playerId,
              x: position.pxToPercent(this.playerElementRef.nativeElement.getBoundingClientRect().left, 'x'),
              y: position.pxToPercent(this.playerElementRef.nativeElement.getBoundingClientRect().top, 'y'),
              width: position.pxToPercent(this.playerElementRef.nativeElement.offsetWidth, 'x'),
              height: position.pxToPercent(this.playerElementRef.nativeElement.offsetHeight, 'y'),
              type: PLAYER_TYPE
            });
          }
        });
      }));
    }
  }

  selectPlayer() {
    this.playerService.setPlayerPlaying(this.playerId);
  }

  increaseScore() {
    this.playerService.updateScore(1, this.playerId);
  }

  decreaseScore() {
    this.playerService.updateScore(-1, this.playerId);
  }

  sendDraggingCoordinates(coordinates: [number, number]) {
    this.draggingService.setPlayerDraggingCoordinates(coordinates);
  }

  triggerDrop() {
    this.draggingService.triggerPlayerDrop();
  }

  mouseDown(e: TouchEvent) {
    this.draggable.mouseDown(e);
    this.draggingService.playerDraggable = this.draggable;
    this.draggingService.playerMouseDown(this.playerId);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
