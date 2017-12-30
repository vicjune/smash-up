import { Component, OnInit } from '@angular/core';

import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player';
import { BaseService } from '@shared/services/base.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuOpen = false;
  deletePopin = false;
  resetPopin = false;
  removedPlayer: Player;

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService
  ) { }

  ngOnInit() {
  }

  deletePlayerClicked(player: Player) {
    this.removedPlayer = player;
    this.deletePopin = true;
    this.menuOpen = false;
  }

  callbackDelete(index: number) {
    if (index === 1) {
      this.playerService.removePlayer(this.removedPlayer.id);
    }
  }

  resetClicked() {
    this.resetPopin = true;
    this.menuOpen = false;
  }

  callbackReset(index: number) {
    if (index === 1) {
      this.playerService.resetGame();
      this.baseService.resetGame();
    }
  }
}
