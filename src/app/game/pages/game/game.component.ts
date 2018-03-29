import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Player } from '@shared/models/player';
import { PlayerService } from '@shared/services/player.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  addPopin = false;
  newPlayerName = '';

  @ViewChild('input') addInput: ElementRef;

  constructor(
    public playerService: PlayerService,
  ) { }

  ngOnInit() {
  }

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
      this.playerService.add(new Player(this.newPlayerName));
    }
  }
}