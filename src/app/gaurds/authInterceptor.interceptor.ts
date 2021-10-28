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
  constructor(private session: SessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return RxJsUtils.getVal(this.session.token$).pipe(switchMap((token) => {
      console.log('token being appended to header: ', token);
      return next.handle(this.addAuthorizationHeader(req, token)).pipe(
        catchError((err => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            console.log('attempt token refresh here');
            this.session.attemptRefresh().then((res) => {
              if (res.success && res.token) {
                return next.handle(this.addAuthorizationHeader(req, res.token));
              } else {
                return throwError(err);
              }
            }, (error) => {
              return throwError(error);
            })
          } else {
            console.log(err);
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
