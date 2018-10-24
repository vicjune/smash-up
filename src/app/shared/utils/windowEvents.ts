import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

const portrait$ = new Observable(observer => {
  const handler = () => observer.next(window.innerHeight > window.innerWidth);
  handler();
  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
}).pipe(shareReplay(1));

export const windowEvents = {
  get portrait() {
    return portrait$;
  }
};
