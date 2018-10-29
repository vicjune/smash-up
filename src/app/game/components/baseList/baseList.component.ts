import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { BaseService } from '@shared/services/base.service';
import { PlayerService } from '@shared/services/player.service';
import { Base } from '@shared/models/base';
import { DELETE_BUTTON_ID, DELETE_BUTTON_TYPE, MAX_BASES } from '@shared/constants';
import { DraggingService } from '@shared/services/dragging.service';
import { windowEvents } from '@shared/utils/windowEvents';
import { position } from '@shared/utils/position';

@Component({
  selector: 'app-base-list',
  templateUrl: './baseList.component.html',
  styleUrls: ['./baseList.component.scss']
})
export class BaseListComponent implements OnInit, AfterViewInit, OnDestroy {
  newBase = false;
  bases$: Observable<string[]>;
  MAX_BASES: number = MAX_BASES;
  creatureDragging$ = this.draggingService.bindCreatureDragging();

  deleteCreatureIsHovered$ = this.draggingService.bindIsHovered(DELETE_BUTTON_ID);
  subscription = new Subscription();

  @ViewChild('deleteCreature') deleteCreatureButton: ElementRef;

  constructor(
    public baseService: BaseService,
    public playerService: PlayerService,
    public draggingService: DraggingService
  ) { }

  ngOnInit() {
    this.bases$ = this.baseService.bindList();
  }

  ngAfterViewInit() {
    this.subscription.add(windowEvents.portrait.subscribe(() => {
      this.draggingService.registerCoordinates({
        itemId: DELETE_BUTTON_ID,
        x: position.pxToPercent(this.deleteCreatureButton.nativeElement.getBoundingClientRect().left, 'x'),
        y: position.pxToPercent(this.deleteCreatureButton.nativeElement.getBoundingClientRect().top, 'y'),
        width: position.pxToPercent(this.deleteCreatureButton.nativeElement.offsetWidth, 'x'),
        height: position.pxToPercent(this.deleteCreatureButton.nativeElement.offsetHeight, 'y'),
        type: DELETE_BUTTON_TYPE
      });
    }));
  }

  addBase() {
    this.newBase = true;
    this.baseService.add(new Base());
  }

  deleteBase(baseId: string) {
    this.baseService.delete(baseId);
  }

  conquerBase(baseId: string) {
    this.baseService.conquer(baseId);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
