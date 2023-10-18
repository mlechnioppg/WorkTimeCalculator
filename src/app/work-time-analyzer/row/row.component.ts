import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InputRowData } from '../../../models/input-row-data';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss']
})
export class RowComponent implements OnInit {
  @Input() row!: InputRowData;
  @Input() small = false;
  @Output() addRowEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeRowEvent: EventEmitter<any> = new EventEmitter<any>();

  types = ['Wejście', 'Wyjście'];

  constructor() { }

  ngOnInit() {
  }

  addRow() {
    this.addRowEvent.emit();
  }

  removeRow() {
    this.removeRowEvent.emit();
  }
}
