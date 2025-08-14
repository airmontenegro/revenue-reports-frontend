import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { LessonApiService } from '../../services/lesson.service'; // <-- your existing service
import { CategoryApiService, CategoryDto } from '../../services/category.service';

// shape we use to render lesson chips
type LessonListItem = { id: string; title: string };

@Component({
  selector: 'app-category-create-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-create-update.html',
})
export class CategoryCreateUpdateComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categories = inject(CategoryApiService);
  private lessonsApi = inject(LessonApiService);

  private destroy$ = new Subject<void>();

  isEdit = false;
  categoryId?: string;
  saving = signal(false);
  loadError = signal<string | null>(null);

  lessons: LessonListItem[] = [];

  form: FormGroup<{
    name: FormControl<string>;
    slug: FormControl<string>;
    shortDescription: FormControl<string | null>;
    imageUrl: FormControl<string | null>;
    lessonIds: FormControl<string[]>;
  }> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    slug: ['', [Validators.required, Validators.maxLength(140)]],
    shortDescription: this.fb.control<string | null>('', [Validators.maxLength(140)]),
    imageUrl: this.fb.control<string | null>('', []),
    lessonIds: this.fb.nonNullable.control<string[]>([]),
  });

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEdit = !!this.categoryId;

    // auto-slug
    this.form.controls.name.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        const slugCtrl = this.form.controls.slug;
        if (!this.isEdit && (slugCtrl.pristine || !slugCtrl.value)) {
          slugCtrl.setValue(this.slugify(v));
          slugCtrl.markAsPristine();
        }
      });

    // load lessons via your LessonApiService
    this.lessonsApi
      .getAllLessons()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.lessons = (items || []).map(l => ({ id: (l as any).id, title: l.title }));
        },
        error: () => this.loadError.set('Failed to load lessons'),
      });

    // load existing category in edit mode
    if (this.isEdit && this.categoryId) {
      this.categories
        .get(this.categoryId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cat) => this.patchForm(cat),
          error: () => this.loadError.set('Failed to load category'),
        });
    }
  }

  private patchForm(cat: CategoryDto) {
    this.form.patchValue({
      name: cat.name ?? '',
      slug: cat.slug ?? '',
      shortDescription: cat.shortDescription ?? '',
      imageUrl: cat.imageUrl ?? '',
      lessonIds: cat.lessonIds ?? [],
    });
  }

  toggleLesson(id: string) {
    const ctrl = this.form.controls.lessonIds;
    const set = new Set(ctrl.value);
    set.has(id) ? set.delete(id) : set.add(id);
    ctrl.setValue([...set]);
    ctrl.markAsDirty();
  }

  isSelected(id: string) {
    return this.form.controls.lessonIds.value.includes(id);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const payload: CategoryDto = {
      name: this.form.controls.name.value.trim(),
      slug: this.form.controls.slug.value.trim(),
      shortDescription: this.form.controls.shortDescription.value || undefined,
      imageUrl: this.form.controls.imageUrl.value || undefined,
      lessonIds: this.form.controls.lessonIds.value,
    };

    const req$ = this.isEdit && this.categoryId
      ? this.categories.update(this.categoryId, payload)
      : this.categories.create(payload);

    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/categories']); // adjust route if needed
      },
      error: () => {
        this.saving.set(false);
        this.loadError.set('Save failed. Please try again.');
      },
    });
  }

  trackByLesson = (_: number, item: LessonListItem) => item.id;

  slugify(v: string): string {
    return (v || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .substring(0, 140);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() { return this.form.controls; }
}
