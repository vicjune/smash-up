import { Subject, Observable } from 'rxjs';

export class Draggable {
  coordinates: number[] = [0, 0];

  private previousCoordinates: number[] = [0, 0];
  private _dragging = false;
  private draggingStart = false;
  private draggingStartTimeout;

  private mouseOffset: number[] = [0, 0];

  private clickEvent$ = new Subject<void>();
  private dragEvent$ = new Subject<boolean>();
  private dropEvent$ = new Subject<number[]>();

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

  get dropEvent(): Observable<number[]> {
    return this.dropEvent$.asObservable();
  }

  mouseDown(e: TouchEvent): void {
    if (!this._dragging && (!e.touches || e.touches.length === 1)) {
      e.preventDefault();
      this.previousCoordinates = this.coordinates;
      this.draggingStart = true;
      this._dragging = true;
      this.dragEvent$.next(true);
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
      const bouncingRect = event.target.getBoundingClientRect();
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
