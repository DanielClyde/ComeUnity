import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  constructor() { }

  ngOnInit() {
    if (Capacitor.isPluginAvailable('StatusBar')) {
      StatusBar.setStyle({ style: Style.Dark });
    }
  }
}
