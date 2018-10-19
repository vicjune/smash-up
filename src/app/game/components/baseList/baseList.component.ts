import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { BaseService } from '@shared/services/base.service';
import { PlayerService } from '@shared/services/player.service';
import { Base } from '@shared/models/base';
import { MAX_PLAYERS } from '@shared/constants';
import { DraggingService } from '@shared/services/dragging.service';
import { windowEvents } from '@shared/utils/windowEvents';
import { position } from '@shared/utils/position';

@Component({
  selector: 'app-base-list',
  templateUrl: './baseList.component.html',
  styleUrls: ['./baseList.component.scss']
})
export class BaseListComponent implements OnInit, AfterViewInit, OnDestroy {
  deletePopin = false;
  conquerPopin = false;
  newBase = false;
  conqueringBase: Base;
  deletingBase: Base;
  bases$: Observable<Base[]>;
  MAX_BASES: number = MAX_PLAYERS + 1;
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  deleteCreatureIsHovered = false;
  subscription = new Subscription();

  @ViewChild('deleteCreature') deleteCreatureButton: ElementRef;

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService,
    public draggingService: DraggingService
  ) { }

  ngOnInit() {
    this.bases$ = this.baseService.bind();
    this.subscription.add(this.draggingService.bindIsHovered('delete_button').subscribe(isHovered => {
      this.deleteCreatureIsHovered = isHovered;
    }));
  }

  ngAfterViewInit() {
    this.subscription.add(windowEvents.portrait.subscribe(() => {
      this.draggingService.registerCoordinates({
        itemId: 'delete_button',
        x: position.pxToPercent(this.deleteCreatureButton.nativeElement.getBoundingClientRect().left, 'x'),
        y: position.pxToPercent(this.deleteCreatureButton.nativeElement.getBoundingClientRect().top, 'y'),
        width: this.deleteCreatureButton.nativeElement.clientWidth,
        height: this.deleteCreatureButton.nativeElement.clientHeight,
        type: 'delete_button'
      });
    }));
  }

  deleteClicked(base: Base) {
    this.deletingBase = base;
    this.deletePopin = true;
  }

  conquerClicked(base: Base) {
    this.conqueringBase = base;
    if (base.resistance > 0) {
      this.conquerPopin = true;
    } else {
      this.conquerBase(1);
    }
  }

  addBase() {
    this.newBase = true;
    this.baseService.add(new Base());
  }

  deleteBase(popinButtonIndex: number) {
    if (popinButtonIndex === 1) {
      this.baseService.delete(this.deletingBase.id);
    }
  }

  conquerBase(popinButtonIndex: number) {
    if (popinButtonIndex === 1) {
      this.baseService.conquer(this.conqueringBase);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
