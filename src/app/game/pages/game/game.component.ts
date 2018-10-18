import { Component, ViewChild, ElementRef } from '@angular/core';

import { Player } from '@shared/models/player';
import { PlayerService } from '@shared/services/player.service';
import { DraggingService } from '@shared/services/dragging.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  addPopin = false;
  newPlayerName = '';
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  @ViewChild('input') addInput: ElementRef;

  constructor(
    public playerService: PlayerService,
    public draggingService: DraggingService
  ) { }

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
