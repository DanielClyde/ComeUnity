import { PlacesService } from './services/places.service';
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
  ) {
    this.platform.ready().then(() => {
      console.log('%c Platform ready', 'color: cyan');
    });
  }
}
