import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements OnInit {

  constructor(
    public playerService: PlayerService
  ) { }

  ngOnInit() {
  }

  addPlayer() {
    this.playerService.addPlayer(new Player());
  }

}
