import { Subject, Observable, Subscription } from 'rxjs';

import { position } from './position';
import { windowEvents } from './windowEvents';

export class Draggable {
  coordinates: [number, number] = [0, 0];

  private previousCoordinates: [number, number] = [0, 0];
  private _dragging = false;
  private draggingStart = false;
  private draggingStartTimeout;
  private target: HTMLElement;

  private mouseOffset: [number, number] = [0, 0];

  private clickEvent$ = new Subject<void>();
  private delayedDragEvent$ = new Subject<boolean>();
  private draggingEvent$ = new Subject<[number, number]>();
  private dropEvent$ = new Subject<[number, number]>();

  private subscription: Subscription;

  constructor() { }

  get dragging(): boolean {
    return this._dragging;
  }

  get clickEvent(): Observable<void> {
    return this.clickEvent$.asObservable();
  }

  get delayedDragEvent(): Observable<boolean> {
    return this.delayedDragEvent$.asObservable();
  }

  get draggingEvent(): Observable<[number, number]> {
    return this.draggingEvent$.asObservable();
  }

  get dropEvent(): Observable<[number, number]> {
    return this.dropEvent$.asObservable();
  }

  mouseDown(downEvent: TouchEvent): void {
    if (!this._dragging && (!downEvent.touches || downEvent.touches.length === 1)) {
      downEvent.preventDefault();
      this.subscription = new Subscription();
      this.subscription.add(windowEvents.mouseMove.subscribe(moveEvent => this.mouseMove(moveEvent)));
      this.subscription.add(windowEvents.mouseUp.subscribe(() => this.mouseUp()));

      this.target = downEvent.target as HTMLElement;
      this.previousCoordinates = this.coordinates;
      this.draggingStart = true;
      this._dragging = true;
      this.mouseOffset = [this.convertEvent(downEvent).offsetX, this.convertEvent(downEvent).offsetY];

      this.draggingStartTimeout = setTimeout(() => {
        this.draggingStart = false;
        this.delayedDragEvent$.next(true);
      }, 200);

      this.mouseMove(downEvent);
    }
  }

  private mouseMove(moveEvent: TouchEvent): void {
    if ((!moveEvent.touches || moveEvent.touches.length === 1)) {
      const x = position.pxToPercent(this.convertEvent(moveEvent).pageX - this.mouseOffset[0], 'x');
      const y = position.pxToPercent(this.convertEvent(moveEvent).pageY - this.mouseOffset[1], 'y');
      let inRangeX = x;
      let inRangeY = y;

      if (x <= 0) {
        inRangeX = 0;
      }
      if (x + position.pxToPercent(this.target.offsetWidth, 'x') >= 100) {
        inRangeX = 100 - position.pxToPercent(this.target.offsetWidth, 'x');
      }

      if (y <= 0) {
        inRangeY = 0;
      }
      if (y + position.pxToPercent(this.target.offsetHeight, 'y') >= 100) {
        inRangeY = 100 - position.pxToPercent(this.target.offsetHeight, 'y');
      }

      this.coordinates = [inRangeX, inRangeY];
      this.draggingEvent$.next(this.coordinates);
    }
  }

  private mouseUp(): void {
    this.subscription.unsubscribe();

    if (this.draggingStart) {
      this.clickEvent$.next();
      this.coordinates = this.previousCoordinates;
    } else {
      this.dropEvent$.next(this.coordinates);
    }

    if (this.draggingStartTimeout) {
      clearTimeout(this.draggingStartTimeout);
    }

    this._dragging = false;
    this.draggingStart = false;
    this.delayedDragEvent$.next(false);
  }

  private convertEvent(event): { pageX: number, pageY: number, offsetX: number, offsetY: number } {
    if ('targetTouches' in event) {
      const bouncingRect = this.target.getBoundingClientRect();
      return {
        pageX: event.targetTouches[0].pageX,
        pageY: event.targetTouches[0].pageY,
        offsetX: event.targetTouches[0].pageX - bouncingRect.left - (window.pageXOffset || document.documentElement.scrollLeft),
        offsetY: event.targetTouches[0].pageY - bouncingRect.top - (window.pageYOffset || document.documentElement.scrollTop)
      };
    } else {
      return {
        pageX: event.pageX,
        pageY: event.pageY,
        offsetX: event.offsetX,
        offsetY: event.offsetY
      };
    }
  }
}
