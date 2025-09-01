import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LessonApiService } from '../../services/lesson.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Lesson } from '../../interfaces/lesson.interface';

@Component({
  selector: 'app-onboarding-lesson-viewer',
  standalone: true,
  imports: [CommonModule],
templateUrl: './onboarding-lesson-viewer.html'
})
export class OnboardingLessonViewer implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private lessons = inject(LessonApiService);
  private destroy$ = new Subject<void>();

  loading = true;
  error: string | null = null;
  lesson?: Lesson;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(p => this.lessons.getLesson(p.get('lessonId') || p.get('id')!)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (l) => { this.lesson = l; this.loading = false; },
        error: (e) => { console.error(e); this.error = 'Failed to load lesson.'; this.loading = false; }
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
