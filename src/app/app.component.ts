import { SessionService } from './services/session.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private session: SessionService,
  ) {
    this.platform.ready().then(() => {
      console.log('%c Platform ready', 'color: cyan');
    });
  }
}
