export class InputRowData {
  constructor(type = '', date = '', time = '') {
    this.type = type;
    this.date = date;
    this.time = time;
  }

  type: string;
  date: string;
  time: string;
  selected = true;

  isEnter() {
    return this.type === 'Wejście' || this.type === 'Wejscie';
  }

  isLeave() {
    return this.type === 'Wyjście' || this.type === 'Wyjscie';
  }
}
