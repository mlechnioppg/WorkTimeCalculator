import { Component, OnInit, Input } from '@angular/core';
import { DayData } from '../../../models/day-data';
import { InputRowData } from '../../../models/input-row-data';

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.scss']
})
export class DayCardComponent implements OnInit {
  @Input() day!: DayData;
  showRanges = false;

  constructor() { }

  ngOnInit() {
  }

  dayRows() {
    return this.day.rows.filter(element => element.date === this.day.date);
  }

  addRow() {
    this.day.rows.push(new InputRowData('', this.day.date, ''));
  }

  removeRow(row: InputRowData) {
    const idx = this.day.rows.indexOf(row);
    this.day.rows.splice(idx, 1);
  }
}
