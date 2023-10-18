import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about-info-dialog',
  templateUrl: './about-info-dialog.component.html',
  styleUrls: ['./about-info-dialog.component.scss']
})
export class AboutInfoDialogComponent implements OnInit {
  disableWelcomeMessage = false;

  constructor() { }

  ngOnInit() {
    this.disableWelcomeMessage = localStorage.getItem('disableWelcomeMessage') === 'true';
  }

  changeDisableWelcomeMessageValue(event: any) {
    localStorage.setItem('disableWelcomeMessage', event.checked);
  }
}
