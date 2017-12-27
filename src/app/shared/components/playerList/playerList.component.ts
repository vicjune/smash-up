import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player';
import { MAX_PLAYERS } from '../../constants';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements OnInit {
  MAX_PLAYERS: number = MAX_PLAYERS;

  constructor(
    public playerService: PlayerService
  ) { }

  ngOnInit() {}

  addPlayer() {
    this.playerService.addPlayer(new Player());
  }

}
