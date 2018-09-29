import { ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';

export class Draggable {
  coordinates: number[] = [0, 0];

  private _dragging = false;
  private draggingStart = false;
  private draggingStartTimeout;

  private mouseOffset: number[] = [0, 0];

  private clickEventSubject = new Subject<void>();
  private dropEventSubject = new Subject<number[]>();

  constructor(private elementRef: ElementRef) {}

  get dragging(): boolean {
    return this._dragging;
  }

  get clickEvent(): Observable<void> {
    return this.clickEventSubject.asObservable();
  }

  get dropEvent(): Observable<number[]> {
    return this.dropEventSubject.asObservable();
  }

  mouseDown(e: TouchEvent): void {
    if (!this._dragging && (!e.touches || e.touches.length === 1)) {
      e.preventDefault();
      this.draggingStart = true;
      this._dragging = true;
      this.mouseOffset = [this.convertEvent(e).offsetX, this.convertEvent(e).offsetY];

      this.draggingStartTimeout = setTimeout(() => {
        this.draggingStart = false;
      }, 200);
    }
  }

  mouseMove(e: TouchEvent): void {
    if (this._dragging && (!e.touches || e.touches.length === 1)) {
      const x = this.toPercentage(this.convertEvent(e).pageX - this.mouseOffset[0], 'x');
      const y = this.toPercentage(this.convertEvent(e).pageY - this.mouseOffset[1], 'y');
      let inRangeX = x;
      let inRangeY = y;

      if (x <= 0) {
        inRangeX = 0;
      }
      if (x + this.toPercentage(300, 'x') >= 100) {
        inRangeX = 100 - this.toPercentage(300, 'x');
      }

      if (y <= 0) {
        inRangeY = 0;
      }
      if (y + this.toPercentage(214, 'y') >= 100) {
        inRangeY = 100 - this.toPercentage(214, 'y');
      }

      this.coordinates = [inRangeX, inRangeY];
    }
  }

  mouseUp() {
    if (this.draggingStartTimeout) {
      clearTimeout(this.draggingStartTimeout);
    }

    if (this._dragging) {
      this._dragging = false;
      this.dropEventSubject.next(this.coordinates);
    }

    if (this.draggingStart) {
      this.draggingStart = false;
      this._dragging = false;
      this.clickEventSubject.next();
    }
  }

  private convertEvent(event) {
    if ('targetTouches' in event) {
      const bouncingRect = this.elementRef.nativeElement.getBoundingClientRect();
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

  private toPercentage(value: number, direction: string): number {
    if (direction === 'x') {
      return value * 100 / window.innerWidth;
    } else if (direction === 'y') {
      return value * 100 / window.innerHeight;
    } else {
      return value;
    }
  }
}
