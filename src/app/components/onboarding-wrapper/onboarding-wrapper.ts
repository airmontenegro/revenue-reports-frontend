import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CategoryApiService, CategoryListItem } from '../../services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-wrapper.html',
  styleUrl: './onboarding-wrapper.scss',
})
export class OnboardingWrapper implements OnInit, OnDestroy {
  private categoriesApi = inject(CategoryApiService);
  private destroy$ = new Subject<void>();

  categories: CategoryListItem[] = [];
  loading = true;
  error: string | null = null;
  constructor(/* … */ private router: Router) { }

  ngOnInit(): void {
    this.categoriesApi
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.categories = items || [];
          this.loading = false;
        },
        error: (e) => {
          this.error = 'Failed to load categories.';
          this.loading = false;
          console.error(e);
        },
      });
  }

  // Placeholder for next iteration where we'll navigate to details
openCategory(c: CategoryListItem) {
  this.router.navigate(['/onboarding/topic', c.slug]);
}

  trackById = (_: number, c: CategoryListItem) => c.id;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
