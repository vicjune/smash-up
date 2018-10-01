import { Component, Input, OnInit } from '@angular/core';
import { CreatureService } from '@shared/services/creature.service';
import { Observable } from 'rxjs';
import { Creature } from '@shared/models/creature';

@Component({
  selector: 'app-creature',
  templateUrl: './creature.component.html',
  styleUrls: ['./creature.component.scss'],
})
export class CreatureComponent implements OnInit {
  @Input() creatureId: string;

  creature: Observable<Creature>;

  constructor(
    public creatureService: CreatureService
  ) {}

  ngOnInit() {
    this.creature = this.creatureService.bindFromId(this.creatureId) as Observable<Creature>;
  }
}
