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
template: `
  <div *ngIf="loading" class="text-gray-400">Loading lesson…</div>
  <div *ngIf="error" class="text-red-600">{{ error }}</div>
  <div *ngIf="!loading && !error && lesson">
    <h2 class="text-xl font-bold text-center my-8">{{ lesson.title }}</h2>
    <p class="text-gray-600 mt-1" *ngIf="lesson.shortDescription">{{ lesson.shortDescription }}</p>



    <div class="prose mt-4" [innerHTML]="lesson.description"></div>
        <div class="my-8" *ngIf="lesson.documentUrl">
      <a [href]="lesson.documentUrl!" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">
        Download lesson PDF
      </a>
    </div>
  </div>
`
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
