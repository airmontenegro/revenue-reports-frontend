// src/app/services/category-api.service.ts
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpMethod } from '../interfaces/httpMethod.interface';
import { UploadParams, UploadService } from './upload.service';

export interface CategoryDto {
  id?: any;
  name: string;
  slug: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  lessonIds?: string[];
}

export interface CategoryListItem extends CategoryDto {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  constructor(private api: ApiService, private uploads: UploadService) {}

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
  createWithOptionalImage(dto: CategoryDto, file?: File, paths?: UploadParams): Observable<CategoryDto> {
    const chain$ = file && paths
      ? this.uploads.uploadFile(file, paths).pipe(
          map(res => ({ ...dto, imageUrl: this.uploads.extractUrl(res) }))
        )
      : of(dto);

    return chain$.pipe(switchMap(finalDto => this.create(finalDto)));
  }

  updateWithOptionalImage(id: string, dto: CategoryDto, file?: File, paths?: UploadParams): Observable<CategoryDto> {
    const chain$ = file && paths
      ? this.uploads.uploadFile(file, paths).pipe(
          map(res => ({ ...dto, imageUrl: this.uploads.extractUrl(res) }))
        )
      : of(dto);

    return chain$.pipe(switchMap(finalDto => this.update(id, finalDto)));
  }
}
