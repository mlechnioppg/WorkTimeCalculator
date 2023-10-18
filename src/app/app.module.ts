import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WorkTimeAnalyzerModule } from './work-time-analyzer/work-time-analyzer.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    WorkTimeAnalyzerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
