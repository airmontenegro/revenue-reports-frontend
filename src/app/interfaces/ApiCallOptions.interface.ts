import { HttpMethod } from "./httpMethod.interface";


export interface ApiCallOptions {
  method: string;                 // 'GET' | 'POST' | ...
  route: string;                  // 'uploads/sharepoint'
  body?: any;                     // JSON or FormData
  params?: Record<string, any>;
  skipErrorHandling?: boolean;

  // NEW (optional)
  responseType?: 'json' | 'blob' | 'text';
  reportProgress?: boolean;       // to get upload progress events
  headers?: Record<string, string | string[]>;
}

