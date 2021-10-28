import { RxJsUtils } from './../../utils/Utils';
import { SessionService } from './../services/session.service';
import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private session: SessionService, private router: Router) { }
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
    return RxJsUtils.getVal(this.session.authorized$).pipe(
      map(a => {
        if (a) {
          return true;
        } else {
          this.router.navigateByUrl('/login');
          return false;
        }
      })
    )
  }
}
