import {
  Component, isDevMode, OnInit, ViewChild, TemplateRef,
  ElementRef,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { DayData } from '../../models/day-data';
import { InputRowData } from '../../models/input-row-data';
import { RangeData } from '../../models/range-data';
import { TestDataHtml } from '../../models/test-data-html';
import { from } from 'rxjs';
import { groupBy } from 'rxjs/internal/operators/groupBy';
import { mergeMap, toArray, map } from 'rxjs/operators';
import { WeekData } from 'src/models/week-data';
import { AboutInfoDialogComponent } from './about-info-dialog/about-info-dialog.component';
import { MonthSummary } from 'src/models/month-summary';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-work-time-analyzer',
  templateUrl: './work-time-analyzer.component.html',
  styleUrls: ['./work-time-analyzer.component.scss']
})
export class WorkTimeAnalyzerComponent implements OnInit, AfterViewInit {
  private monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  input = '';
  days: DayData[] = [];
  weeks: WeekData[] = [];
  rows: InputRowData[] = [];
  monthSummary: MonthSummary[] = [];
  showRowSelection = false;
  showDays = false;
  isDevMode = true;
  userFullName!: string;
  processed = false;
  parsingSucceded = false;
  @ViewChild('welcomeMessageTemplate')
  private welcomeMessageTemplate!: TemplateRef<any>;
  @ViewChild('noWorkingDaysTemplate')
  private noWorkingDaysTemplate!: TemplateRef<any>;

  noWorkingDaysDialogRef: any;

  @ViewChild('textareaParse')
  textareaElement!: ElementRef;

  displayedColumns: string[] = ['month', 'balance', 'timestamp', 'options'];
  dataSource = this.monthSummary;

  constructor(public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private renderer: Renderer2) {
    this.isDevMode = isDevMode();
  }

  ngOnInit() {
    setTimeout(() => {
      if (localStorage.getItem('disableWelcomeMessage') !== 'true') {
        this.openWelcomeDialog();
      }

      this.monthSummary = JSON.parse(localStorage.getItem('monthSummary')!) || [];
      this.dataSource = [...this.monthSummary];
    }, 0);
  }

  ngAfterViewInit(): void {
    if (this.textareaElement !== null) {
      this.renderer.listen(this.textareaElement.nativeElement, 'paste', (event) => {
        setTimeout(() => {
          this.parseHtmlInputTetaMe();
          this.processSelectedRows();
        });
      });
    }
  }

  groupDaysIntoWeeks() {
    this.weeks = [];
    const days = from(this.days);
    const grouped = days.pipe(
      groupBy(day => day.weekNumber()),
      // return each item in group as array
      mergeMap(group => group.pipe(toArray())),
      map(arr => ({ 'weekNumber': arr[0].weekNumber(), 'days': arr, selected: false }))
    );

    grouped.subscribe(val => this.weeks.push(val));
  }

  addRowAtIndex(index: number) {
    const row = this.rows[index];

    if (row.isEnter()) {
      this.rows.splice(index + 1, 0, new InputRowData('Wyjście', row.date));
    } else {
      this.rows.splice(index + 1, 0, new InputRowData('Wejście', row.date));
    }
  }

  removeRowAtIndex(index: number) {
    this.rows.splice(index, 1);
  }

  parseHtmlInput() {
    this.showDays = false;
    this.rows = [];

    if (this.input.length === 0) {
      return;
    }

    let input = this.input;

    input = input.replace('<tbody>', '');
    input = input.replace('</tbody>', '');
    input = input.replace(/<tr class="oddRow">/g, '');
    input = input.replace(/<tr class="evenRow">/g, '');
    input = input.replace(/ class="listRow"/g, '');
    input = input.replace(/ align="left"/g, '');
    input = input.replace(/ align="center"/g, '');
    input = input.replace(/<img src="\/ppg\/skins\/default_constellation\/graphics\/common\/false.gif">/g, '');

    const rows = input.split('</tr>');

    rows.forEach(element => {
      const row = element.replace(/<td>/g, '').split('</td>');
      if (row.length === 12) {
        this.rows.push(new InputRowData(row[4].trim(), row[2].trim(), row[3].trim()));
      }
    });

    this.showRowSelection = this.rows.length > 0;
  }

  parseHtmlInputTetaMe() {
    try {
      this.parsingSucceded = false;
      this.showDays = false;
      this.rows = [];
      this.days = [];
      if (this.input.length === 0) {
        return;
      }
      const allDivs =
        this.input.match(/<ui5-accordion-item[\s\S]*?id="undefined"[\s\S]*?>([\s\S]*?)<\/div>[\s\S]*?<\/ui5-accordion-item>/g);
      const dateValueInput = this.input.match(/<input type="hidden" value="(.*?)">/);
      const dateValue = dateValueInput ? dateValueInput[1] : '';
      const date = new Date(dateValue);

      try {
        this.userFullName = this.input.match(/<div class="media-body media-middle like-h4">(.*?)<\/div>/)![1];
      } catch (error) {
        this.userFullName = 'X Stranger';
      }

      for (const day of allDivs!) {
        const dayOfMonth = day.match(/<div>(.*?)<\/div>/)![1];
        const dateOfAction = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + dayOfMonth).slice(-2)}`;
        const regex = /class="entry"> (.*?) <\/span><\/div> (Wejście|Wyjście)/g;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(day)) !== null) {
          let eventName = match[2];
          let time = match[1].trim();
          if (time.length === 4) {
            time = '0' + time;
          }
          this.rows.push(new InputRowData(eventName, dateOfAction, time));
        }
      }

      this.showRowSelection = this.rows.length > 0;
      this.processed = true;
      this.parsingSucceded = true;
    } catch (error) {
      this.snackBar.open('Error when parsing pasted html', 'Close', {
        duration: 15000
      });
    }
  }

  processSelectedRows() {
    this.showDays = true;
    this.days = [];

    const entering = this.rows.filter(element => element.isEnter() && element.selected);
    const leaving = this.rows.filter(element => element.isLeave() && element.selected);

    for (let index = 0; index < entering.length; index++) {
      const entered = entering[index];
      const left = leaving.find(leave => leave.date === entered.date && leave.time > entered.time);

      if (left !== undefined) {
        const range = new RangeData(entered.time, left.time);
        const dayIndex = this.days.findIndex(day => day.date === entered.date);

        if (dayIndex === -1) {
          const newDay = new DayData(entered.date);
          newDay.ranges.push(range);
          newDay.rows = this.rows;
          this.days.push(newDay);
        } else {
          this.days[dayIndex].ranges.push(range);
          this.days[dayIndex].rows = this.rows;
        }
      } else {
        console.log(`Didn't left on ${entered.date}`);
        const newDay = new DayData(entered.date, false);
        newDay.rows = this.rows;
        this.days.push(newDay);
      }
    }

    this.showRowSelection = false;
    this.groupDaysIntoWeeks();
    const monthName = this.days.length ? +this.days[0].date.substring(5, 7) - 1 : 'None';

    if (monthName !== 'None') {
      const month = this.monthSummary.find(x => x.month === this.monthNames[monthName]);

      if (month) {
        month.value = this.monthMinutes();
        month.timestamp = new Date().toLocaleString();
      } else {
        this.monthSummary.push({ month: this.monthNames[monthName], value: this.monthMinutes(), timestamp: new Date().toLocaleString() });
      }

      this.setMonthsLocalStorage();
    }

    if (!this.days.length && this.userFullName) {
      this.openNoWorkingDaysDialog();
    }
    // console.log('days: ', this.days);
  }

  monthsSummary() {
    return this.monthSummary.map(x => x.value).reduce((prev, curr) => prev + curr, 0);
  }

  loadTestDataHtml() {
    this.input = TestDataHtml;
  }

  summaryText(minutes: number) {
    // const minutes = this.monthMinutes();
    return `${Math.abs(minutes)} ${Math.abs(minutes) === 1 ? 'minute' : 'minutes'} ${minutes >= 0 ? 'overtime' : 'below'}`;
  }

  summarySelectedText() {
    const minutes = this.selectedMinutes();
    return `SELECTED: ${Math.abs(minutes)} ${Math.abs(minutes) === 1 ? 'minute' : 'minutes'} ${minutes >= 0 ? 'overtime' : 'below'}`;
  }

  monthMinutes() {
    return (this.days.reduce((sum, element) => {
      const result = new DayData();
      result.minutes = sum.minutes + element.minutesToFullDay();
      return result;
    }, new DayData())).minutes;
  }

  selectedMinutes() {
    return (this.days.filter(element => element.selected).reduce((sum, element) => {
      const result = new DayData();
      result.minutes = sum.minutes + element.minutesToFullDay();
      return result;
    }, new DayData())).minutes;
  }

  selectAll(week: WeekData) {
    for (let index = 0; index < week.days.length; index++) {
      const element = week.days[index];
      element.selected = true;
    }
  }

  deselectAll(week: WeekData) {
    for (let index = 0; index < week.days.length; index++) {
      const element = week.days[index];
      element.selected = false;
    }
  }

  openAboutDialog() {
    this.dialog.open(AboutInfoDialogComponent);
  }

  openWelcomeDialog() {
    this.dialog.open(this.welcomeMessageTemplate);
  }

  openNoWorkingDaysDialog() {
    this.noWorkingDaysDialogRef = this.dialog.open(this.noWorkingDaysTemplate);
  }

  closeNoWorkingDaysDialog() {
    this.noWorkingDaysDialogRef.close();
  }

  summarySelectedInWeek(week: WeekData) {
    const minutes = this.selectedMinutesInWeek(week);
    return `${Math.abs(minutes)} ${Math.abs(minutes) === 1 ? 'minute' : 'minutes'} ${minutes >= 0 ? 'overtime' : 'below'}`;
  }

  selectedMinutesInWeek(week: WeekData) {
    return (week.days.filter(element => element.selected).reduce((sum, element) => {
      const result = new DayData();
      result.minutes = sum.minutes + element.minutesToFullDay();
      return result;
    }, new DayData())).minutes;
  }

  setMonthsLocalStorage() {
    localStorage.setItem('monthSummary', JSON.stringify(this.monthSummary));
    this.dataSource = [...this.monthSummary];
  }
}
