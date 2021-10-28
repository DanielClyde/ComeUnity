import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface HttpOptions {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  params?: HttpParams | {
    [param: string]: string | string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  get<T>(url: string, options?: HttpOptions): Promise<T> {
    return this.http.get<T>(this.formatUrl(url), { ...options }).toPromise();
  }

  post<T>(url: string, body: any, options?: HttpOptions): Promise<T> {
    return this.http.post<T>(this.formatUrl(url), body, { ...options }).toPromise();
  }

  put<T>(url: string, body: any, options?: HttpOptions): Promise<T> {
    return this.http.put<T>(this.formatUrl(url), body, { ...options }).toPromise();
  }

  delete<T>(url: string, options?: HttpOptions): Promise<T> {
    return this.http.delete<T>(this.formatUrl(url), { ...options }).toPromise();
  }

  private formatUrl(url: string) {
    return environment.backend + url;
  }

}
