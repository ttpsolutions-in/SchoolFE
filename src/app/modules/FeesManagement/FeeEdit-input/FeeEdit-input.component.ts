import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'FeeEditInput',
  templateUrl: './FeeEdit-input.component.html',
  styleUrls: ['./FeeEdit-input.component.scss'],
})
export class FeeEditInputComponent implements OnInit {
  @Input() data: string;
  @Output() focusOut: EventEmitter<string> = new EventEmitter<string>();
  @Output() tried: EventEmitter<string> = new EventEmitter<string>();
  currency = '$';
  editMode = false;
  constructor() { }

  ngOnInit() { }

  onFocusOut() {
    this.focusOut.emit(this.data);
  }
  oninputfocus() {
    this.tried.emit(this.data);
    //console.log(this.data);
  }
  keypress(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
}

