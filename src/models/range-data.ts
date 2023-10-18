export class RangeData { // possible rename to PeriodData
  constructor(from: string = '', to: string = '') {
    this.from = from;
    this.to = to;

    const dateTo = new Date(2018, 1, 1, parseInt(to.split(':')[0], 10), parseInt(to.split(':')[1], 10), 0, 0);
    const dateFrom = new Date(2018, 1, 1, parseInt(from.split(':')[0], 10), parseInt(from.split(':')[1], 10), 0, 0);
    const minutesAll = (dateTo.getTime() - dateFrom.getTime()) / 1000 / 60;
    const hours = Math.floor(minutesAll / 60);
    const minutes = minutesAll % 60;

    this.minutes = minutesAll;
    this.time = hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
  }

  from: string;
  to: string;
  minutes: number;
  time: string;
}
