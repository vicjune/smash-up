import { Observable } from 'rxjs';
import { shareReplay, share } from 'rxjs/operators';

const portrait$ = new Observable<boolean>(observer => {
  const handler = () => observer.next(window.innerHeight > window.innerWidth);
  handler();
  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
}).pipe(shareReplay(1));

const mouseMove$ = new Observable<TouchEvent>(observer => {
  const handler = e => observer.next(e);
  window.addEventListener('mousemove', handler);
  window.addEventListener('touchmove', handler);
  return () => {
    window.removeEventListener('mousemove', handler);
    window.removeEventListener('touchmove', handler);
  };
}).pipe(share());

const mouseUp$ = new Observable<void>(observer => {
  const handler = () => observer.next();
  window.addEventListener('mouseup', handler);
  window.addEventListener('mouseleave', handler);
  window.addEventListener('touchend', handler);
  window.addEventListener('touchcancel', handler);
  return () => {
    window.removeEventListener('mouseup', handler);
    window.removeEventListener('mouseleave', handler);
    window.removeEventListener('touchend', handler);
    window.removeEventListener('touchcancel', handler);
  };
}).pipe(share());

export const windowEvents = {
  get portrait() {
    return portrait$;
  },

  get mouseMove() {
    return mouseMove$;
  },

  get mouseUp() {
    return mouseUp$;
  }
};
