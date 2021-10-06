import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PermissionStatus, PushNotifications, Token } from '@capacitor/push-notifications';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor() {
    if (Capacitor.isNativePlatform) {
      PushNotifications.requestPermissions().then((status: PermissionStatus) => {
        if (status.receive !== 'denied') {
          this.initNotificationListeners();
          PushNotifications.register();
        }
      });
    }
  }

  private initNotificationListeners() {
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('REGISTRATION SUCCESS', token);
    });
    PushNotifications.addListener('registrationError', (err) => {
      console.log('REGISTRATION FAILED', err);
    });
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('NOTIFICATION RECEIVED', notification);
    });
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('ACTION', action);
    });
  }

}
