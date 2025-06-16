import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import {
  from,
  throwError,
  switchMap,
  catchError,
  Observable,
  of,
} from 'rxjs';
import { ApiCallOptions } from '../interfaces/ApiCallOptions.interface';




@Injectable({ providedIn: 'root' })
export class ApiService {

  private scope = ['api://9ac61894-832b-4a38-8258-e4d641a95f2d/user_impersonation'];
  baseUrl: string = `http://localhost:3000/`;
  constructor(private http: HttpClient, private msalService: MsalService) {}

  call<T>(options: ApiCallOptions): Observable<T> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        let httpParams = new HttpParams();
        if (options.params) {
          Object.entries(options.params).forEach(([key, value]) => {
            httpParams = httpParams.set(key, value.toString());
          });
        }

        const config = {
          headers,
          params: httpParams,
        };

        const url = `${this.baseUrl}${options.route}`;

        switch (options.method.toUpperCase()) {
          case 'GET':
            return this.http.get<T>(url, config);
          case 'POST':
            return this.http.post<T>(url, options.body || {}, config);
          case 'PUT':
            return this.http.put<T>(url, options.body || {}, config);
          case 'DELETE':
            return this.http.delete<T>(url, config);
          case 'PATCH':
            return this.http.patch<T>(url, options.body || {}, config);
          default:
            return throwError(() => new Error(`Unsupported HTTP method: ${options.method}`));
        }
      }),
      options.skipErrorHandling ? o => o : catchError(this.handleError)
    );
  }

  private getAccessToken(): Observable<string> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return throwError(() => new Error('No active account'));

    return from(
      this.msalService.instance.acquireTokenSilent({
        scopes: this.scope,
        account,
      })
    ).pipe(
      switchMap((result) => of(result.accessToken))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ API error:', error);
    let message = 'Something went wrong';

    if (error.status === 401) message = 'Unauthorized';
    else if (error.status === 403) message = 'Forbidden';
    else if (error.status === 404) message = 'Not found';
    else if (error.status === 500) message = 'Server error';

    return throwError(() => new Error(message));
  }
}
