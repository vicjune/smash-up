import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timer'
})
export class TimerPipe implements PipeTransform {
  transform(value: number): string {
    if (value < 0) {
      value = 0;
    }
    const minutes = Math.floor(((value + 9) / 600));
    let seconds = Math.ceil((value % 600) / 10);
    seconds = seconds === 60 ? 0 : seconds;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
}
