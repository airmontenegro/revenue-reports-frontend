import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of, switchMap, takeUntil, tap, catchError } from 'rxjs';

import { LessonApiService } from '../../../services/lesson.service';
import { CategoryApiService, CategoryDto } from '../../../services/category.service';


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
  slug?: string;
  saving = signal(false);
  loadError = signal<string | null>(null);
  categoryId: string = '';
  lessons: LessonListItem[] = [];

  form: FormGroup<{
    name: FormControl<string>;
    slug: FormControl<string>;
    shortDescription: FormControl<string | null>;
    imageUrl: FormControl<string | null>;
    documentUrl: FormControl<string | null>
    lessonIds: FormControl<string[]>;
  }> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    slug: ['', [Validators.required, Validators.maxLength(140)]],
    shortDescription: this.fb.control<string | null>('', [Validators.maxLength(140)]),
    imageUrl: this.fb.control<string | null>('', []), // will be set by upload response
    documentUrl: this.fb.control<string | null>('', []), // will be set by upload response
    lessonIds: this.fb.nonNullable.control<string[]>([]),
  });

  // local UI state for selected file
  selectedFile: File | null = null;
  previewSrc: string | null = null;

  selectedDoc: File | null = null;
  private readonly MAX_DOC_MB = 20;
  private readonly PDF_MIME = 'application/pdf';

  // where to store images in SharePoint (adjust to your tenant)
  private readonly sharepointPaths = {
    sitePath: '/sites/info_wall',       // backend forces this anyway
    imageFolderPath: 'images/categories',
    docFolderPath: 'docs/categories',   // or 'docs/acknowledgements'
  };

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || undefined;
    this.isEdit = !!this.slug;

    // auto-generate slug from name (create mode)
    this.form.controls.name.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        const slugCtrl = this.form.controls.slug;
        if (!this.isEdit && (slugCtrl.pristine || !slugCtrl.value)) {
          slugCtrl.setValue(this.slugify(v));
          slugCtrl.markAsPristine();
        }
      });

    // load lessons for chips
    this.lessonsApi.getAllLessons()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.lessons = (items || []).map(l => ({ id: (l as any).id, title: l.title }));
        },
        error: () => this.loadError.set('Failed to load lessons'),
      });

    // edit mode: load category
    if (this.isEdit && this.slug) {
      this.categories.get(this.slug)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cat) => this.patchForm(cat),
          error: () => this.loadError.set('Failed to load category'),
        });
    }
  }

  private patchForm(cat: CategoryDto) {
    this.categoryId = cat.id;
    this.form.patchValue({
      name: cat.name ?? '',
      slug: cat.slug ?? '',
      shortDescription: cat.shortDescription ?? '',
      imageUrl: cat.imageUrl ?? '',
      documentUrl: cat.documentUrl,
      lessonIds: cat.lessonIds ?? [],
    });
  }

  // === Image selection & preview ===
  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = (input.files && input.files[0]) || null;
    this.clearPreviewOnly();

    if (!file) {
      this.selectedFile = null;
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      this.loadError.set('Image exceeds 20 MB limit.');
      return;
    }

    this.selectedFile = file;
    this.previewSrc = URL.createObjectURL(file);
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.clearPreviewOnly();
  }

  // Called by (change)="onDocSelected($event)" on the <input type="file">
  onDocSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = (input.files && input.files[0]) || null;

    if (!file) {
      this.selectedDoc = null;
      return;
    }

    // size check (20 MB to match your backend interceptor)
    const maxBytes = this.MAX_DOC_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      this.loadError.set(`PDF exceeds ${this.MAX_DOC_MB} MB limit.`);
      this.selectedDoc = null;
      return;
    }

    // type check (accept only PDF)
    const isPdfMime = file.type === this.PDF_MIME;
    const isPdfExt = (file.name.split('.').pop() || '').toLowerCase() === 'pdf';
    if (!isPdfMime && !isPdfExt) {
      this.loadError.set('Only PDF files are allowed.');
      this.selectedDoc = null;
      return;
    }

    this.selectedDoc = file;
  }

  clearSelectedDoc() {
    this.selectedDoc = null;
  }

  private clearPreviewOnly() {
    if (this.previewSrc) {
      URL.revokeObjectURL(this.previewSrc);
      this.previewSrc = null;
    }
  }

  // === Lessons chip helpers ===
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

  trackByLesson = (_: number, item: LessonListItem) => item.id;

  // === Submit ===
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.loadError.set(null);

    const baseDto: CategoryDto = {
      name: this.form.controls.name.value.trim(),
      slug: this.form.controls.slug.value.trim(),
      shortDescription: this.form.controls.shortDescription.value || null,
      imageUrl: this.form.controls.imageUrl.value || null, // may be overwritten if file selected
      documentUrl: this.form.controls.documentUrl.value || null,
      lessonIds: this.form.controls.lessonIds.value,
    };

    const req$ = this.isEdit && this.slug
      ? this.categories.updateWithOptionalFiles(
        this.categoryId,
        baseDto,
        { image: this.selectedFile || undefined, document: this.selectedDoc || undefined },
        this.sharepointPaths
      )
      : this.categories.createWithOptionalFiles(
        baseDto,
        { image: this.selectedFile || undefined, document: this.selectedDoc || undefined },
        this.sharepointPaths
      )

    req$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.saving.set(false)),
        catchError((e) => {
          this.saving.set(false);
          this.loadError.set(e?.message || 'Save failed. Please try again.');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res) {
          this.router.navigate(['/categories']);
        }
      });
  }

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
    this.clearPreviewOnly();
  }

  get f() { return this.form.controls; }
}
