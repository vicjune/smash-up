import { BehaviorSubject } from 'rxjs';

const portrait$ = new BehaviorSubject<boolean>(false);
const windowSize$ = new BehaviorSubject<number[]>([0, 0]);

checkOrientation();
window.addEventListener('orientationchange', checkOrientation, false);
window.addEventListener('resize', checkOrientation, false);

function checkOrientation() {
  portrait$.next(window.innerHeight > window.innerWidth);
  windowSize$.next([window.innerWidth, window.innerHeight]);
}

export const windowEvents = {
  get portrait() {
    return portrait$.asObservable();
  },
  get windowSize() {
    return windowSize$.asObservable();
  }
};
