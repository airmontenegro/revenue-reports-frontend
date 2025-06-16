import { HttpMethod } from "./httpMethod.interface";


export interface ApiCallOptions {
  method: HttpMethod;
  route: string;
  body?: any;
  params?: Record<string, string | number | boolean>;
  skipErrorHandling?: boolean;
}

