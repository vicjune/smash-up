import { TimerService } from '@shared/services/timer.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  constructor(
    public timerService: TimerService,
  ) { }

  ngOnInit() {
  }

}
