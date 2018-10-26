import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { Player } from '@shared/models/player';
import { PlayerService } from '@shared/services/player.service';
import { DraggingService } from '@shared/services/dragging.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  addPopin = false;
  alreadyAdded = false;
  newPlayerName = '';
  newPlayerColor = null;
  creatureDragging$ = this.draggingService.bindCreatureDragging();
  creatureDraggingId$ = this.draggingService.bindCreatureDraggingId();
  availableColors: number[] = [];

  subscription = new Subscription();

  @ViewChild('input') addInput: ElementRef;

  constructor(
    public playerService: PlayerService,
    public draggingService: DraggingService
  ) { }

  ngOnInit() {
    this.subscription.add(this.playerService.bindAvailableColors().subscribe(availableColors => this.availableColors = availableColors));
  }

  addPlayerClicked() {
    this.newPlayerName = '';
    this.newPlayerColor = this.availableColors[0];
    this.addPopin = true;
    this.alreadyAdded = false;
    setTimeout(() => {
      this.addInput.nativeElement.focus();
    });
  }

  addPlayer(index: number) {
    this.addPopin = false;
    if (index === 1 && !this.alreadyAdded) {
      this.alreadyAdded = true;
      this.playerService.add(new Player(this.newPlayerName, this.newPlayerColor));
    }
  }
}
