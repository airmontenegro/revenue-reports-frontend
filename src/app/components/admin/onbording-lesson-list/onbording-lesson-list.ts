import { Component, OnDestroy } from '@angular/core';
import { Lesson } from '../../../interfaces/lesson.interface';
import { LessonApiService } from '../../../services/lesson.service';
import { Router } from '@angular/router';
import { Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onbording-lesson-list',
  imports: [CommonModule],
  templateUrl: './onbording-lesson-list.html',
  styleUrl: './onbording-lesson-list.scss'
})
export class OnbordingLessonList implements OnDestroy {
  lessons: Lesson[] = [];
  loading = false;
  ngUnsubscribe: Subject<any> = new Subject();

  constructor(private lessonApi: LessonApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadLessons()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe();
  }

  loadLessons(): Observable<Lesson[]> {
    this.loading = true;
    return this.lessonApi.getAllLessons()
      .pipe(tap({
        next: (data) => {
          this.lessons = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Failed to load lessons', err);
          this.loading = false;
        },
      }));
  }

  editLesson(id: any): void {
    this.router.navigate(['/lessons/edit', id]);
  }

  deleteLesson(id: any): void {
    if (confirm('Are you sure you want to delete this lesson?')) {
      this.lessonApi.deleteLesson(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.lessons = this.lessons.filter((lesson) => lesson.id !== id);
          console.log('✅ Lesson deleted');
        },
        error: (err) => console.error('❌ Delete failed', err),
      });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
