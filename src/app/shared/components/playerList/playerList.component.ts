import { Component, Output, EventEmitter } from '@angular/core';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS } from '../../constants';
import { DraggingService } from '@shared/services/dragging.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent {
  @Output() addPlayer = new EventEmitter<void>();

  MAX_PLAYERS = MAX_PLAYERS;
  playerList$ = this.playerService.bindList();
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public draggingService: DraggingService,
  ) { }

  addPlayerClicked() {
    this.addPlayer.emit();
  }
}
