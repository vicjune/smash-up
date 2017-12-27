import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popin',
  templateUrl: './popin.component.html',
  styleUrls: ['./popin.component.scss']
})
export class PopinComponent implements OnInit {
  @Input() title: string;
  @Input() buttons: {text: string, noClose?: boolean, secondary?: boolean, danger?: boolean}[];
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() buttonPressed: EventEmitter<number> = new EventEmitter<number>();

  private _modal = false;
  @Output() modalChange = new EventEmitter();
  @Input()
  get modal(): boolean {
    return this._modal;
  }
  set modal(val: boolean) {
    this._modal = val;
    this.modalChange.emit(val);
  }

  constructor() { }

  ngOnInit() {
  }

  onCloseClick() {
    this.modal = false;
    this.close.emit();
  }

  onButtonClick(index) {
    if (!this.buttons[index].noClose) {
      this.modal = false;
    }
    this.buttonPressed.emit(index);
  }
}
