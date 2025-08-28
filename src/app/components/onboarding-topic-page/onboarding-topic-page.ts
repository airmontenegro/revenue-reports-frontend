import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { Subject, map, switchMap, takeUntil } from 'rxjs';
import { CategoryApiService } from '../../services/category.service';


// shape of the response you showed
type ThemeItem = { id: string; title: string; shortDescription?: string | null };
type TopicDto = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  documentUrl?: string | null;     // <-- consent PDF
  themes?: ThemeItem[];            // <-- lessons live here
};

@Component({
  selector: 'app-onboarding-topic-page',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './onboarding-topic-page.html',
  styleUrl: './onboarding-topic-page.scss'
})
export class OnboardingTopicPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categories = inject(CategoryApiService);

  private destroy$ = new Subject<void>();

  loading = true;
  error: string | null = null;

  topic?: TopicDto;
  lessons: ThemeItem[] = [];

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(pm => pm.get('slug')!),
        switchMap(slug => this.categories.get(slug)), // your API accepts slug here
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (cat: any) => {
          this.topic = cat as TopicDto;
          this.lessons = this.topic.themes ?? [];
          this.loading = false;

          // auto-navigate to first lesson if there is no child route yet
          if (!this.route.firstChild && this.lessons.length) {
            this.router.navigate(['lesson', this.lessons[0].id], { relativeTo: this.route });
          }
        },
        error: (e) => {
          console.error(e);
          this.error = 'Failed to load topic.';
          this.loading = false;
        }
      });
  }

  trackByLesson = (_: number, l: ThemeItem) => l.id;

  isActive(id: string | undefined) {
    return this.route.snapshot.firstChild?.paramMap.get('lessonId') === id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
