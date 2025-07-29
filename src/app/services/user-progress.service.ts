// user-progress.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpMethod } from '../interfaces/httpMethod.interface';

export interface UserProgressPayload {
  lessonId: string;
  isCompleted: boolean;
  answers: {
    questionId: string;
    selectedAnswerId: string;
  }[];
}

export interface UpdateUserProgressPayload {
  isCompleted: boolean;
  answers: {
    questionId: string;
    selectedAnswerId: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  constructor(private api: ApiService) {}

  submitProgress(payload: UserProgressPayload): Observable<any> {
    return this.api.call({
      method: HttpMethod.POST,
      route: 'progress',
      body: payload,
    });
  }

  updateProgress(lessonId: string, payload: UpdateUserProgressPayload): Observable<any> {
    return this.api.call({
      method: HttpMethod.PATCH,
      route: `progress/${lessonId}`,
      body: payload,
    });
  }

  getProgress(): Observable<any> {
    return this.api.call({
      method: HttpMethod.GET,
      route: 'progress/me',
    });
  }

  getAllProgress(): Observable<any> {
    return this.api.call({
      method: HttpMethod.GET,
      route: 'progress/all',
    });
  }
}
