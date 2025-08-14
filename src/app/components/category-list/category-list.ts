import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable, takeUntil, tap } from 'rxjs';
import { CategoryApiService, CategoryDto } from '../../services/category.service';


export interface Category {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  imageUrl?: string;
  lessonIds?: string[];
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss'],
})
export class CategoryListComponent implements OnDestroy {
  categories: CategoryDto[] = [];
  loading = false;
  ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private categoriesApi: CategoryApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
  }

  loadCategories(): Observable<CategoryDto[]> {
    this.loading = true;
    return this.categoriesApi.list().pipe(
      tap({
        next: (data) => {
          this.categories = data ?? [];
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Failed to load categories', err);
          this.loading = false;
        },
      })


    );
  }

  createCategory(): void {
    this.router.navigate(['/admin/category/new']);
  }

  editCategory(slug: any): void {
    this.router.navigate(['/admin/categories/edit', slug]);
  }

  deleteCategory(id: any): void {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.categoriesApi
      .remove(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== id);
          console.log('✅ Category deleted');
        },
        error: (err) => console.error('❌ Delete failed', err),
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
