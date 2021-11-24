import { StorageKeys, StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Injectable } from '@angular/core';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  get initialized() { return this._initialized; }
  get isDenied() { return this._isDenied; }
  private _initialized = false;
  private _isDenied = false;

  pnDeviceToken$ = new BehaviorSubject<string>(null);
  pnRegistrationFailed$ = new BehaviorSubject<boolean>(null);
  notificationReceived$ = new BehaviorSubject<PushNotificationSchema>(null);
  notificationAction$ = new BehaviorSubject<ActionPerformed>(null);

  constructor(private storage: StorageService) {
    this.pnDeviceToken$.subscribe((token) => this.storage.setStringInStorage(StorageKeys.PUSH_NOTIFICATIONS_TOKEN, token));
    this.initNotificationListeners();
    this.storage.getStringFromStorage(StorageKeys.PUSH_NOTIFICATIONS_TOKEN).then((t) => t ? this.pnDeviceToken$.next(t) : null);
  }

  async register() {
    if (Capacitor.isNativePlatform()) {
      const status = await PushNotifications.requestPermissions();
      if (status.receive !== 'denied') {
        PushNotifications.register();
        this._isDenied = false;
      } else {
        this._isDenied = true;
      }
    } else {
      this._isDenied = true;
    }
    this._initialized = true;
  }

  private initNotificationListeners() {
    if (Capacitor.isNativePlatform()) {
      PushNotifications.addListener('registration', (token: Token) => this.pnDeviceToken$.next(token.value));
      PushNotifications.addListener('registrationError', (err) => this.pnRegistrationFailed$.next(true));
      PushNotifications.addListener('pushNotificationReceived', (notification) => this.notificationReceived$.next(notification));
      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => this.notificationAction$.next(action));
    }
  }
}
