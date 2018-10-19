import { BehaviorSubject } from 'rxjs';

const portrait$ = new BehaviorSubject<boolean>(false);

checkOrientation();
window.addEventListener('orientationchange', checkOrientation, false);
window.addEventListener('resize', checkOrientation, false);

function checkOrientation() {
  portrait$.next(window.innerHeight > window.innerWidth);
}

export const windowEvents = {
  get portrait() {
    return portrait$.asObservable();
  }
};
