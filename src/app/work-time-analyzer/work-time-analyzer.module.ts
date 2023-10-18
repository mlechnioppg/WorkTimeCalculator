import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayCardComponent } from './day-card/day-card.component';
import { RowComponent } from './row/row.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../common/modules/material.module';
import { AboutInfoDialogComponent } from './about-info-dialog/about-info-dialog.component';
import { WorkTimeAnalyzerComponent } from './work-time-analyzer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
  ],
  declarations: [
    DayCardComponent,
    RowComponent,
    AboutInfoDialogComponent,
    WorkTimeAnalyzerComponent,
  ],
  exports: [
    WorkTimeAnalyzerComponent
  ],
})
export class WorkTimeAnalyzerModule { }
