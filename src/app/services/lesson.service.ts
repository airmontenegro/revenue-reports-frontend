import { Injectable } from '@angular/core';
import { Observable, of, switchMap, map } from 'rxjs';
import { ApiService } from './api.service';
import { Lesson } from '../interfaces/lesson.interface';
import { HttpMethod } from '../interfaces/httpMethod.interface';
import { UploadService } from './upload.service';

export type LessonDto = {
  id?: string;
  title: string;
  shortDescription: string;
  description: string;
  documentUrl?: string | null; // stores the uploaded PDF webUrl
  isDeleted?: boolean;
};

type OptionalFiles = { document?: File };

/**
 * Pass folder paths **relative to the document library root**, e.g.:
 *   docFolderPath: 'docs/lessons'
 * Do NOT include "Shared Documents".
 */
type SharePointPaths = { sitePath?: string; docFolderPath: string };

@Injectable({ providedIn: 'root' })
export class LessonApiService {
  private readonly baseRoute = 'onboarding-lessons';
  private readonly DEFAULT_SITE = '/sites/info_wall'; // your backend forces this anyway

  constructor(
    private api: ApiService,
    private uploads: UploadService,
  ) {}

  getAllLessons(): Observable<Lesson[]> {
    return this.api.call<Lesson[]>({
      method: HttpMethod.GET,
      route: this.baseRoute,
    });
  }

  getLesson(id: string): Observable<Lesson> {
    return this.api.call<Lesson>({
      method: HttpMethod.GET,
      route: `${this.baseRoute}/${id}`,
    });
  }

  createLesson(lesson: LessonDto): Observable<LessonDto> {
    return this.api.call<LessonDto>({
      method: HttpMethod.POST,
      route: this.baseRoute,
      body: lesson,
    });
  }

  updateLesson(id: string, lesson: LessonDto): Observable<LessonDto> {
    return this.api.call<LessonDto>({
      method: HttpMethod.PUT,
      route: `${this.baseRoute}/${id}`,
      body: lesson,
    });
  }

  deleteLesson(id: string): Observable<void> {
    return this.api.call<void>({
      method: HttpMethod.DELETE,
      route: `${this.baseRoute}/${id}`,
    });
  }

  /**
   * Create with optional PDF upload:
   * - If a file is provided, upload first (to sp.docFolderPath),
   *   then set documentUrl from the upload response.
   */
  createWithOptionalFiles(
    baseDto: LessonDto,
    files: OptionalFiles,
    sp: SharePointPaths
  ): Observable<LessonDto> {
    if (!files.document) {
      return this.createLesson(baseDto);
    }

    return this.uploads.uploadFile(files.document, {
      sitePath: sp.sitePath ?? this.DEFAULT_SITE,
      folderPath: sp.docFolderPath, // e.g. 'docs/lessons'
    }).pipe(
      map(res => ({
        ...baseDto,
        documentUrl: this.uploads.extractUrl(res) || baseDto.documentUrl || null,
      })),
      switchMap(dto => this.createLesson(dto)),
    );
  }

  /**
   * Update with optional PDF upload:
   * - If a file is provided, upload first (to sp.docFolderPath),
   *   then set documentUrl from the upload response.
   */
  updateWithOptionalFiles(
    id: string,
    baseDto: LessonDto,
    files: OptionalFiles,
    sp: SharePointPaths
  ): Observable<LessonDto> {
    if (!files.document) {
      return this.updateLesson(id, baseDto);
    }

    return this.uploads.uploadFile(files.document, {
      sitePath: sp.sitePath ?? this.DEFAULT_SITE,
      folderPath: sp.docFolderPath, // e.g. 'docs/lessons'
    }).pipe(
      map(res => ({
        ...baseDto,
        documentUrl: this.uploads.extractUrl(res) || baseDto.documentUrl || null,
      })),
      switchMap(dto => this.updateLesson(id, dto)),
    );
  }
}
