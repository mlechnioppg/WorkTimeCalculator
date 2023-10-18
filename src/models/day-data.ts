import { RangeData } from './range-data';
import { InputRowData } from './input-row-data';

export class DayData {
  constructor(date: string = '', valid = true) { this.date = date; this.valid = valid; }
  date: string;
  ranges: RangeData[] = [];
  selected = true;
  valid = true;
  minutes = 0;
  rows: InputRowData[] = [];
  
  totalMinutes(): number {
    return (this.ranges.reduce((sum, element) => {
      const result = new RangeData();
      result.minutes = sum.minutes + element.minutes;
      return result;
    })).minutes;
  }

  minutesToFullDay() {
    if (!this.valid) {
      return 0;
    }

    if (this.ranges.length > 1) {
      return this.totalMinutes() - 480;
    } else {
      return this.ranges[0].minutes - 480;
    }
  }

  getClass() {
    return this.minutesToFullDay() >= 0 ? 'green' : 'red';
  }

  getTime() {
    if (!this.valid) {
      return '00:00';
    }

    let sum = 0;

    if (this.ranges.length > 1) {
      sum = this.totalMinutes();
    } else {
      sum = this.ranges[0].minutes;
    }

    const hoursInner = Math.floor(sum / 60);
    const minutesInner = sum % 60;
    return hoursInner + ':' + (minutesInner < 10 ? '0' + minutesInner : minutesInner);
  }

  weekNumber() {
    const realDate = new Date(this.date);
    const date = new Date(realDate.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }
}
