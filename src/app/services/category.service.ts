// src/app/services/category-api.service.ts
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpMethod } from '../interfaces/httpMethod.interface';
import { UploadParams, UploadService } from './upload.service';

export interface CategoryDto {
  id?: any;
  name: string;
  slug: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  documentUrl?: string | null;
   themes?: Array<{ id: string; title: string; shortDescription?: string | null }>; 
  lessonIds?: string[];
}

export interface CategoryListItem extends CategoryDto {
  id: string;
}

type CategoryFiles = { image?: File; document?: File };

type CategoryUploadFolders = {
  sitePath: string;
  imageFolderPath: string; // e.g. "images/categories"
  docFolderPath: string;   // e.g. "docs/acknowledgements"
};

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  constructor(private api: ApiService, private uploads: UploadService) { }

  list(params?: { q?: string; page?: number; limit?: number }): Observable<CategoryListItem[]> {
    return this.api.call<CategoryListItem[]>({
      method: HttpMethod.GET,
      route: 'categories',
      params: params as any,
    });
  }

  get(id: string): Observable<CategoryDto> {
    return this.api.call<CategoryDto>({
      method: HttpMethod.GET,
      route: `categories/${id}`,
    });
  }

  create(dto: CategoryDto): Observable<CategoryDto> {
    return this.api.call<CategoryDto>({
      method: HttpMethod.POST,
      route: 'categories',
      body: dto,
    });
  }

  update(id: string, dto: CategoryDto): Observable<CategoryDto> {    
    return this.api.call<CategoryDto>({
      method: HttpMethod.PUT,
      route: `categories/${id}`,
      body: dto,
    });
  }

  remove(id: string): Observable<void> {
    return this.api.call<void>({
      method: HttpMethod.DELETE,
      route: `categories/${id}`,
    });
  }

  /** High-level helpers that include optional image upload */
  createWithOptionalFiles(
    dto: CategoryDto,
    files: CategoryFiles,
    folders: CategoryUploadFolders
  ) {
    // Build the upload observables we need
    const ops: Array<ReturnType<UploadService['uploadFile']>> = [];

    if (files.image) {
      ops.push(this.uploads.uploadFile(files.image, {
        sitePath: folders.sitePath,
        folderPath: folders.imageFolderPath, // <— just the folder(s), NOT "Shared Documents/..."
      }));
    }

    if (files.document) {
      ops.push(this.uploads.uploadFile(files.document, {
        sitePath: folders.sitePath,
        folderPath: folders.docFolderPath,
      }));
    }

    // If neither file, just create
    if (!ops.length) {
      return this.create(dto);
    }

    // If one or both, upload in parallel then merge URLs into dto and create
    return forkJoin(ops).pipe(
      map(results => {
        // Preserve order: if both exist, result[0] is image, result[1] is pdf (based on push order)
        let idx = 0;
        const final: CategoryDto = { ...dto };

        if (files.image) {
          final.imageUrl = this.uploads.extractUrl(results[idx++]);
        }
        if (files.document) {
          final.documentUrl = this.uploads.extractUrl(results[idx++]);
        }
        return final;
      }),
      switchMap(finalDto => this.create(finalDto))
    );
  }

  updateWithOptionalFiles(
    id: string,
    dto: CategoryDto,
    files: CategoryFiles,
    folders: CategoryUploadFolders
  ) {
    const ops: Array<ReturnType<UploadService['uploadFile']>> = [];

    if (files.image) {
      ops.push(this.uploads.uploadFile(files.image, {
        sitePath: folders.sitePath,
        folderPath: folders.imageFolderPath,
      }));
    }

    if (files.document) {
      ops.push(this.uploads.uploadFile(files.document, {
        sitePath: folders.sitePath,
        folderPath: folders.docFolderPath,
      }));
    }

    if (!ops.length) {
      return this.update(id, dto);
    }

    return forkJoin(ops).pipe(
      map(results => {
        let idx = 0;
        const final: CategoryDto = { ...dto };

        if (files.image) {
          final.imageUrl = this.uploads.extractUrl(results[idx++]);
        }
        if (files.document) {
          final.documentUrl = this.uploads.extractUrl(results[idx++]);
        }
        console.log("final", final);
        return final;
      }),
      switchMap(finalDto => this.update(id, finalDto))
    );
  }
}
