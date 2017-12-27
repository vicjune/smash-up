import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  addPopin = false;
  newPlayerName = '';

  @ViewChild('input') addInput: ElementRef;

  constructor(
    public playerService: PlayerService,
  ) { }

  ngOnInit() {}

  addPlayerClicked() {
    this.newPlayerName = '';
    this.addPopin = true;
    setTimeout(() => {
      this.addInput.nativeElement.focus();
    });
  }

  addPlayer(index: number) {
    this.addPopin = false;
    if (index === 1) {
      this.playerService.addPlayer(new Player(this.newPlayerName));
    }
  }

  selectPlayer(id) {
    this.playerService.setPlayerPlaying(id);
  }

  increaseScore(id) {
    this.playerService.updateScore(1, id);
  }

  decreaseScore(id) {
    this.playerService.updateScore(-1, id);
  }

}
