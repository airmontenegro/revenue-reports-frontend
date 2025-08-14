import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Lesson } from '../interfaces/lesson.interface';
import { HttpMethod } from '../interfaces/httpMethod.interface';


export type LessonDto = {
  id?: string;
  title: string;
  shortDescription: string;
  description: string;
  isDeleted?: boolean;
};

@Injectable({ providedIn: 'root' })
export class LessonApiService {
  private readonly baseRoute = 'onboarding-lessons';

  constructor(private api: ApiService) {}

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
}
