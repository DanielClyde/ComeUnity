import { Capacitor } from '@capacitor/core';
import { User, DeviceStats } from 'comeunitymodels/src/db/User';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { PushNotificationService } from './push-notification.service';
import { RxJsUtils } from '../../utils/Utils';
import { HttpService } from './http.service';
import { StorageKeys, StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { isEqual } from 'lodash';
import { Device } from '@capacitor/device';

export interface LoginResponse {
  user?: User;
  token?: string;
  refreshToken?: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  user$ = new BehaviorSubject<User>(null);
  token$ = new BehaviorSubject<string>(null);
  refreshToken$ = new BehaviorSubject<string>(null);
  deviceIdForRefresh$ = new BehaviorSubject<string>(null);
  authorized$ = combineLatest([this.user$, this.token$]).pipe(
    map(([user, token]) => !!user && !!token),
    distinctUntilChanged(),
  );

  private userLastFetchedAt: Date;

  constructor(
    private storage: StorageService,
    private http: HttpService,
    private pushNotifications: PushNotificationService,
  ) {
    this.init();
  }

  async attemptRefresh(): Promise<LoginResponse> {
    const refreshToken = await RxJsUtils.getPromiseVal(this.refreshToken$);
    const res = await this.http.post<LoginResponse>('api/auth/refresh', { refreshToken });
    return this.handleLoginResponse(res);
  }

  async loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
    try {
      const [deviceInfo, deviceIdForRefresh] = await Promise.all([
        Device.getInfo(),
        RxJsUtils.getPromiseVal(this.deviceIdForRefresh$)
      ]);
      const body = {
        email,
        password,
        deviceIdForRefresh,
        platform: deviceInfo?.platform || null,
      };
      const res = await this.http.post<LoginResponse>('api/auth/credentials', body);
      console.log(res);
      return this.handleLoginResponse(res);
    } catch (e) {
      console.log('Error logging in', e);
    }
    return { success: false };
  }

  async loginWithAppleResponse(value): Promise<LoginResponse> {
    try {
      const [deviceInfo, deviceIdForRefresh] = await Promise.all([
        Device.getInfo(),
        RxJsUtils.getPromiseVal(this.deviceIdForRefresh$)
      ]);
      const body = {
        ...value,
        deviceIdForRefresh,
        platform: deviceInfo?.platform || null,
      }
      console.log('signing in with apple', body);
      const res = await this.http.post<LoginResponse>('api/auth/apple', body);
      return this.handleLoginResponse(res);
    } catch (e) {
      console.log('Error logging in with apple', e);
    }
    return { success: false };
  }

  async logout() {
    this.token$.next(null);
    this.user$.next(null);
    await this.storage.remove(StorageKeys.USER);
    await this.storage.remove(StorageKeys.TOKEN);
  }

  private userFetched(doc: any): User {
    console.log('user fetched', doc);
    if (!doc || !doc._id || !doc.email) { return; }
    this.userLastFetchedAt = new Date();
    this.storage.setStringInStorage(StorageKeys.USER_LAST_FETCHED_AT, this.userLastFetchedAt.toISOString());
    const user = doc; // TODO:  figure out why new User doesn't work
    if (!isEqual(user, this.user$.value)) {
      this.user$.next(user);
    }
    this.storage.setObjectInStorage(StorageKeys.USER, user);
    if (!this.pushNotifications.initialized) {
      this.pushNotifications.register();
    }
    return user;
  }

  private handleLoginResponse(res: LoginResponse): LoginResponse {
    console.log('handleLoginResponse', res);
    if (res.token) {
      this.token$.next(res.token);
      this.storage.setStringInStorage(StorageKeys.TOKEN, res.token);
    }
    if (res.refreshToken) {
      this.refreshToken$.next(res.refreshToken);
      this.storage.setStringInStorage(StorageKeys.REFRESH_TOKEN, res.refreshToken);
    }
    if (res.user) {
      this.userFetched(res.user);
    }
    return res;
  }

  private async init() {
    // TODO: Add back User constructor
    this.storage.getObjectFromStorage<User>(StorageKeys.USER).then((user) => user ? this.user$.next(user) : null);
    this.storage.getStringFromStorage(StorageKeys.TOKEN).then((t) => t ? this.token$.next(t) : null);
    this.storage.getStringFromStorage(StorageKeys.REFRESH_TOKEN).then((t) => t ? this.refreshToken$.next(t) : null);
    this.storage.getStringFromStorage(StorageKeys.DEVICE_ID_FOR_REFRESH).then((id) => {
      if (!id) {
        id = uuid();
        this.storage.setStringInStorage(StorageKeys.DEVICE_ID_FOR_REFRESH, id);
      }
      this.deviceIdForRefresh$.next(id);
    });
    combineLatest([
      this.user$.pipe(filter((u) => !!u)),
      this.pushNotifications.pnDeviceToken$.pipe(filter((t) => !!t)),
    ]).subscribe(([user, deviceToken]) => {
      this.updateDevicePushToken(user, deviceToken);
    });
  }

  private async updateDevicePushToken(user: User, token: string) {
    const deviceStats: DeviceStats = {
      ...user.device,
      pushDeviceToken: token,
      platform: Capacitor.getPlatform() as 'ios' | 'web' | 'android',
    };
    if (isEqual(user.device, deviceStats)) {
      return;
    } else {
      try {
        console.log('updating user device stats', deviceStats);
        const res = await this.http.put<{ success: boolean, user?: User }>(`api/user/${user._id}/device-stats`, deviceStats);
        console.log('user device stats updated response', res);
        if (res?.success && res.user) {
          this.userFetched(user);
        }
      } catch (e) {
        console.log('failed to update user device stats', e);
      }
    }
  }

}
