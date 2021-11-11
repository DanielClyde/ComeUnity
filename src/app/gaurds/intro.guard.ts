import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RxJsUtils } from './../../utils/Utils';
import { SessionService } from './../services/session.service';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanLoad {

  constructor(private router: Router, private session: SessionService) { }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
    return RxJsUtils.getVal(this.session.user$).pipe(
      map((u) => {
        if (u && u.interests?.length) {
          return true;
        } else {
          this.router.navigateByUrl('/intro', { replaceUrl: true });
          return false;
        }
      })
    );
  }
}
