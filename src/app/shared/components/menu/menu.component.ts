import { Component, OnInit } from '@angular/core';

import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuOpen = false;

  constructor(
    public playerService: PlayerService
  ) { }

  ngOnInit() {
  }

  resetGame() {
    this.playerService.resetGame();
  }

  deletePlayer(id: string) {
    this.playerService.removePlayer(id);
  }

}
