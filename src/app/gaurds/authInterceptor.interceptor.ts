import { RxJsUtils } from './../../utils/Utils';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { SessionService } from "../services/session.service";
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private failedToRefresh = false;
  constructor(private session: SessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return RxJsUtils.getVal(this.session.token$).pipe(switchMap((token) => {
      return next.handle(this.addAuthorizationHeader(req, token)).pipe(
        catchError((err => {
          if (!req.url.includes('auth/refresh') && (err instanceof HttpErrorResponse && err.status === 401)) {
            this.session.attemptRefresh().then((res) => {
              if (res.success && res.token) {
                return next.handle(this.addAuthorizationHeader(req, res.token));
              } else {
                return throwError('Failed to refresh token');
              }
            }, (error) => {
              return throwError(error);
            })
          } else {
            return throwError(err);
          }
        }))
      );
    }))
  }

  private addAuthorizationHeader(req: HttpRequest<any>, token: string) {
    return req.clone(token ? { headers: req.headers.set('Authorization', token)} : undefined);
  }
}
