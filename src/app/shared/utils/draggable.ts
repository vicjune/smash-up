import { Subject, Observable } from 'rxjs';

import { position } from './position';

export class Draggable {
  coordinates: [number, number] = [0, 0];

  private previousCoordinates: [number, number] = [0, 0];
  private _dragging = false;
  private draggingStart = false;
  private draggingStartTimeout;
  private target: HTMLElement;

  private mouseOffset: [number, number] = [0, 0];

  private clickEvent$ = new Subject<void>();
  private dragEvent$ = new Subject<boolean>();
  private draggingEvent$ = new Subject<[number, number]>();
  private dropEvent$ = new Subject<[number, number]>();

  constructor() {}

  get dragging(): boolean {
    return this._dragging;
  }

  get clickEvent(): Observable<void> {
    return this.clickEvent$.asObservable();
  }

  get dragEvent(): Observable<boolean> {
    return this.dragEvent$.asObservable();
  }

  get draggingEvent(): Observable<[number, number]> {
    return this.draggingEvent$.asObservable();
  }

  get dropEvent(): Observable<[number, number]> {
    return this.dropEvent$.asObservable();
  }

  mouseDown(e: TouchEvent): void {
    if (!this._dragging && (!e.touches || e.touches.length === 1)) {
      e.preventDefault();
      this.target = e.target as HTMLElement;
      this.previousCoordinates = this.coordinates;
      this.draggingStart = true;
      this._dragging = true;
      this.mouseOffset = [this.convertEvent(e).offsetX, this.convertEvent(e).offsetY];

      this.draggingStartTimeout = setTimeout(() => {
        this.draggingStart = false;
        this.dragEvent$.next(true);
      }, 200);

      this.mouseMove(e);
    }
  }

  mouseMove(e: TouchEvent): void {
    if (this._dragging && (!e.touches || e.touches.length === 1)) {
      const x = position.pxToPercent(this.convertEvent(e).pageX - this.mouseOffset[0], 'x');
      const y = position.pxToPercent(this.convertEvent(e).pageY - this.mouseOffset[1], 'y');
      let inRangeX = x;
      let inRangeY = y;

      if (x <= 0) {
        inRangeX = 0;
      }
      if (x + position.pxToPercent(this.target.clientWidth, 'x') >= 100) {
        inRangeX = 100 - position.pxToPercent(this.target.clientWidth, 'x');
      }

      if (y <= 0) {
        inRangeY = 0;
      }
      if (y + position.pxToPercent(this.target.clientHeight, 'y') >= 100) {
        inRangeY = 100 - position.pxToPercent(this.target.clientHeight, 'y');
      }

      this.coordinates = [inRangeX, inRangeY];
      this.draggingEvent$.next(this.coordinates);
    }
  }

  mouseUp() {
    if (this._dragging) {
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
      this.dragEvent$.next(false);
    }
  }

  private convertEvent(event) {
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
