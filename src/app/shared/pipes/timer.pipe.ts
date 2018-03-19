import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timer'
})
export class TimerPipe implements PipeTransform {
  transform(value: number): string {
    const minutes = Math.floor(value / 600);
    const seconds = Math.floor((value % 600) / 10);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
}
