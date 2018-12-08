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

const fullscreen$ = new Observable<boolean>(observer => {
  const handler = () => observer.next(
    !!(
      (<any>document).fullscreenElement ||
      (<any>document).webkitFullscreenElement ||
      (<any>document).mozFullScreenElement ||
      (<any>document).msFullscreenElement
    )
  );
  handler();
  document.addEventListener('fullscreenchange', handler);
  document.addEventListener('webkitfullscreenchange', handler);
  document.addEventListener('mozfullscreenchange', handler);
  document.addEventListener('MSFullscreenChange', handler);
  return () => {
    document.removeEventListener('fullscreenchange', handler);
    document.removeEventListener('webkitfullscreenchange', handler);
    document.removeEventListener('mozfullscreenchange', handler);
    document.removeEventListener('MSFullscreenChange', handler);
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

  get fullscreen() {
    return fullscreen$;
  },

  get mouseMove() {
    return mouseMove$;
  },

  get mouseUp() {
    return mouseUp$;
  },

  toggleFullscreen() {
    const doc = document as any;
    if (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    ) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      const docElem = document.documentElement as any;
      if (docElem.requestFullscreen) {
        docElem.requestFullscreen();
      } else if (docElem.mozRequestFullScreen) {
        docElem.mozRequestFullScreen();
      } else if (docElem.webkitRequestFullscreen) {
        docElem.webkitRequestFullscreen();
      } else if (docElem.msRequestFullscreen) {
        docElem.msRequestFullscreen();
      }
    }
  }
};
