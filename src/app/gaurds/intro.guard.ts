import { StorageKeys, StorageService } from './../services/storage.service';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanLoad {

  constructor(private router: Router, private storage: StorageService) { }

  async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    const hasSeenIntro = await this.storage.getBoolFromStorage(StorageKeys.INTRO_SEEN);
    if (hasSeenIntro) {
      return true;
    } else {
      this.router.navigateByUrl('/intro', { replaceUrl: true });
      return false;
    }
  }
}
