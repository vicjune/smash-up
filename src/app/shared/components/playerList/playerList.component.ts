import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { PlayerService } from '../../services/player.service';
import { BaseService } from '@shared/services/base.service';
import { MAX_PLAYERS } from '../../constants';
import { Observable } from 'rxjs';
import { ConqueringScore } from '@shared/models/conqueringScore';
import { DraggingService } from '@shared/services/dragging.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './playerList.component.html',
  styleUrls: ['./playerList.component.scss']
})
export class PlayerListComponent implements OnInit {
  MAX_PLAYERS: number = MAX_PLAYERS;
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  @Output('addPlayer') addPlayer = new EventEmitter<void>();

  constructor(
    public playerService: PlayerService,
    public baseService: BaseService,
    public draggingService: DraggingService,
  ) { }

  ngOnInit() {}

  getConqueringScores$(playerId: string): Observable<ConqueringScore[]> {
    return this.playerService.bindConqueringScores(playerId);
  }

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
