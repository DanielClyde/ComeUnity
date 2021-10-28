import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

export enum StorageKeys {
  TOKEN = 'token',
  USER = 'user',
  USER_LAST_FETCHED_AT = 'userLastFetchedAt',
  DEVICE_ID_FOR_REFRESH = 'deviceIdForRefresh',
  REFRESH_TOKEN = 'refreshToken',
  INTRO_SEEN = 'introSeen',
  PUSH_NOTIFICATIONS_TOKEN = 'pushNotificationsToken',
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public async setBoolInStorage(key: StorageKeys, val: boolean): Promise<void> {
    await Storage.set({ key, value: val ? 'true' : 'false' });
  }

  public async getBoolFromStorage(key: StorageKeys): Promise<boolean> {
    const data = await Storage.get({ key });
    return data && data.value === 'true' ? true : false;
  }

  public async getStringFromStorage(key: StorageKeys): Promise<string | null> {
    const data = await Storage.get({ key });
    return data && data.value && data.value !== 'null' ? data.value : null;
  }

  public async setStringInStorage(key: StorageKeys, value: string) {
    await Storage.set({ key, value });
  }

  public async getObjectFromStorage<T>(key: StorageKeys, constructFn?: (args?) => T): Promise<T> {
    let obj = null;
    try {
      const data = await Storage.get({ key });
      obj = data && data.value && data.value !== 'null' ? JSON.parse(data.value) : null;
    } catch (e) {
      console.log(`Error loading ${key} from storage`, e);
    }
    if (obj !== null && constructFn) {
      return constructFn(obj);
    } else { return obj; }
  }

  public async setObjectInStorage(key: StorageKeys, obj: any): Promise<void> {
    await Storage.set({ key, value: JSON.stringify(obj) });
  }

  public async remove(key: StorageKeys): Promise<void> {
    await Storage.remove({ key });
  }
}
