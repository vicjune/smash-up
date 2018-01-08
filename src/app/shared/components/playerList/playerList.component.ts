import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { Player } from '../../models/player';
import { MAX_PLAYERS } from '../../constants';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements OnInit {
  MAX_PLAYERS: number = MAX_PLAYERS;

  @Output('addPlayer') addPlayer = new EventEmitter<void>();

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
  ) { }

  ngOnInit() {}

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

}
