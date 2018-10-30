import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS } from '../../constants';
import { DraggingService } from '@shared/services/dragging.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements OnInit, OnDestroy {
  @Output() addPlayer = new EventEmitter<void>();

  MAX_PLAYERS = MAX_PLAYERS;
  playerList$ = this.playerService.bindList();
  creatureDragging$ = this.draggingService.bindCreatureDragging();
  playerDraggingId: string = null;
  forcedSize: [number, number] = null;

  subscription = new Subscription();

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public draggingService: DraggingService,
  ) { }

  ngOnInit() {
    this.subscription.add(this.draggingService.bindPlayerDraggingCoordinates().subscribe(coord => {
      if (coord) {
        this.playerDraggingId = coord.itemId;
        this.forcedSize = [coord.width, coord.height];
      } else {
        this.playerDraggingId = null;
        this.forcedSize = null;
      }
    }));
  }

  addPlayerClicked() {
    this.addPlayer.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
