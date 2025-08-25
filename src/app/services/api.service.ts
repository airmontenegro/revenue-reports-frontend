// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { from, of, switchMap, catchError, throwError, Observable } from 'rxjs';

// Minimal shape expected by this service.
// If you already have ApiCallOptions elsewhere, keep using it; just ensure these fields exist.
export interface ApiCallOptions {
  method: string; // 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  route: string;  // e.g. 'uploads/sharepoint'
  body?: any;     // JSON or FormData
  params?: Record<string, any>;
  headers?: Record<string, string | string[]>;
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
  reportProgress?: boolean;   // when true, returns Observable<HttpEvent<T>>
  skipErrorHandling?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Audience/Scope for your own API (not Graph). Your backend should exchange it (OBO) when needed.
  private scope = ['api://9ac61894-832b-4a38-8258-e4d641a95f2d/user_impersonation'];
  baseUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient, private msal: MsalService) {}

  // ---------- Overloads ----------
  // With progress: observe 'events'
  call<T>(options: ApiCallOptions & { reportProgress: true }): Observable<HttpEvent<T>>;
  // Normal: observe 'body'
  call<T>(options: ApiCallOptions & { reportProgress?: false }): Observable<T>;
  // Implementation
  call<T>(options: ApiCallOptions): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const isFormData =
          typeof FormData !== 'undefined' && options.body instanceof FormData;

        // Headers
        let headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        if (options.headers) {
          for (const [k, v] of Object.entries(options.headers)) {
            headers = headers.set(k, Array.isArray(v) ? v.join(',') : v);
          }
        }
        // Only set JSON content-type when NOT sending FormData
        if (!isFormData && !headers.has('Content-Type')) {
          headers = headers.set('Content-Type', 'application/json');
        }

        // Params
        let params = new HttpParams();
        if (options.params) {
          for (const [k, v] of Object.entries(options.params)) {
            if (v !== undefined && v !== null) params = params.set(k, String(v));
          }
        }

        const method = options.method.toUpperCase();
        const url = `${this.baseUrl}${options.route}`;

        // IMPORTANT: split branches so TypeScript chooses the correct overload
        if (options.reportProgress) {
          // Progress branch: Angular's overload for observe:'events' expects responseType 'json' | undefined
          return this.http.request<T>(method, url, {
            headers,
            params,
            body: options.body ?? null,
            observe: 'events',
            reportProgress: true,
            responseType: 'json', // keep as 'json' for this overload
          });
        } else {
          // Normal branch: allow any responseType
          return this.http.request<T>(method, url, {
            headers,
            params,
            body: options.body ?? null,
            observe: 'body',
            responseType: (options.responseType ?? 'json') as any,
          });
        }
      }),
      options.skipErrorHandling ? (s) => s : catchError(this.handleError)
    );
  }

  // ---------- Auth helper ----------
  private getAccessToken(): Observable<string> {
    const account = this.msal.instance.getActiveAccount();
    if (!account) return throwError(() => new Error('No active account'));

    return from(
      this.msal.instance.acquireTokenSilent({
        scopes: this.scope,
        account,
      })
    ).pipe(switchMap((res) => of(res.accessToken)));
  }

  // ---------- Error handler ----------
  private handleError(error: HttpErrorResponse) {
    console.error('❌ API error:', error);
    let message = 'Something went wrong';
    if (error.status === 0) message = 'Network error';
    else if (error.status === 401) message = 'Unauthorized';
    else if (error.status === 403) message = 'Forbidden';
    else if (error.status === 404) message = 'Not found';
    else if (error.status === 413) message = 'Payload too large';
    else if (error.status >= 500) message = 'Server error';
    return throwError(() => new Error(message));
  }
}
