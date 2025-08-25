// src/app/services/upload.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { HttpMethod } from '../interfaces/httpMethod.interface';
import { HttpEvent, HttpEventType } from '@angular/common/http';

export interface UploadParams {
  sitePath: string;       // e.g. "/sites/MySite"
  folderPath: string;     // e.g. "Shared Documents/Images/Categories"
  route?: string;         // default "uploads/sharepoint"
  filenameOverride?: string;
  extraFields?: Record<string, string>;
}

export interface UploadResult {
  webUrl?: string;
  url?: string;
  driveId?: string;
  itemId?: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private api: ApiService) {}

  /** Simple upload: returns final result (no progress stream) */
  uploadFile(file: File, params: UploadParams): Observable<UploadResult> {
    const fd = this.buildFormData(file, params);
    return this.api.call<UploadResult>({
      method: HttpMethod.POST,
      route: params.route ?? 'uploads/sharepoint',
      body: fd
    });
  }

  /** Upload with progress: emits HttpEvents so you can compute % uploaded */
  uploadFileWithProgress(
    file: File,
    params: UploadParams
  ): Observable<HttpEvent<UploadResult>> {
    const fd = this.buildFormData(file, params);
    return this.api.call<UploadResult>({
      method: HttpMethod.POST,
      route: params.route ?? 'uploads/sharepoint',
      body: fd,
      reportProgress: true,
    });
  }

  /** Convenience to derive image URL field from result */
  extractUrl(res: UploadResult): string {
    return res.webUrl ?? res.url ?? '';
  }

  private buildFormData(file: File, params: UploadParams): FormData {
    const fd = new FormData();
    fd.append('file', file, params.filenameOverride ?? file.name);
    fd.append('sitePath', params.sitePath);
    fd.append('folderPath', params.folderPath);
    if (params.extraFields) {
      for (const [k, v] of Object.entries(params.extraFields)) {
        fd.append(k, v);
      }
    }
    return fd;
  }
}
