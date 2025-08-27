import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LessonApiService } from '../../../services/lesson.service';

@Component({
  selector: 'app-create-update-onboarding-lesson',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './create-update-onboarding-lesson.html',
  styleUrl: './create-update-onboarding-lesson.scss',
})
export class CreateUpdateOnboardingLesson implements OnInit, OnDestroy {
  // inputs
  @Input() isEdit = false;
  @Input() lessonId?: string;

  // DI via inject() to match your category component style
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lessonApi = inject(LessonApiService);

  // signals & lifecycle
  saving = signal(false);
  loadError = signal<string | null>(null);
  private destroy$ = new Subject<void>();

  // doc upload state
  selectedDoc: File | null = null;
  readonly MAX_DOC_MB = 20;
  private readonly PDF_MIME = 'application/pdf';

  // SharePoint paths (align with your backend)
  private readonly sharepointPaths = {
    sitePath: '/sites/info_wall', // backend forces this anyway
    docFolderPath: 'docs/lessons',
  };

  readonly MAX_TITLE = 120;
  readonly MAX_SHORT = 140;

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(this.MAX_TITLE)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(this.MAX_SHORT)]],
    description: ['', [Validators.required]],
    documentUrl: [''], // <-- NEW
    isDeleted: [false],
  });

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image', 'link'],
      [{ align: [] }],
      [{ header: [1, 2, 3, false] }],
    ],
    imageResize: { modules: ['Resize', 'DisplaySize', 'Toolbar'] },
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || undefined;
    this.lessonId = this.lessonId ?? id;
    this.isEdit = !!this.lessonId;

    if (this.isEdit && this.lessonId) {
      this.lessonApi
        .getLesson(this.lessonId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.form.patchValue({
              title: data.title ?? '',
              shortDescription: data.shortDescription ?? '',
              description: data.description ?? '',
              documentUrl: (data as any).documentUrl ?? '', // <-- NEW
              isDeleted: (data as any).isDeleted ?? false,
            });
          },
          error: () => this.loadError.set('Failed to load lesson'),
        });
    }
  }

  get f() { return this.form.controls; }

  // === Document selection (PDF only, 20MB) ===
  onDocSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = (input.files && input.files[0]) || null;

    if (!file) { this.selectedDoc = null; return; }

    const maxBytes = this.MAX_DOC_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      this.loadError.set(`PDF exceeds ${this.MAX_DOC_MB} MB limit.`);
      this.selectedDoc = null;
      return;
    }

    const isPdfMime = file.type === this.PDF_MIME;
    const isPdfExt = (file.name.split('.').pop() || '').toLowerCase() === 'pdf';
    if (!isPdfMime && !isPdfExt) {
      this.loadError.set('Only PDF files are allowed.');
      this.selectedDoc = null;
      return;
    }

    this.selectedDoc = file;
    // do NOT set documentUrl yet; the backend will return it after upload
  }

  clearSelectedDoc() {
    this.selectedDoc = null;
  }

  clearDocumentUrl() {
    this.form.patchValue({ documentUrl: '' });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.loadError.set(null);

    // DTO includes documentUrl (may be empty if no previously saved doc)
    const payload = {
      title: (this.f['title'].value as string).trim(),
      shortDescription: (this.f['shortDescription'].value as string).trim(),
      description: (this.f['description'].value as string).trim(),
      documentUrl: (this.f['documentUrl'].value as string) || null,
      isDeleted: !!this.f['isDeleted'].value,
    };

    // Use the same pattern as categories: *WithOptionalFiles
    // (document is optional; backend will upload & set documentUrl)
    const req$ = this.isEdit && this.lessonId
      ? (this.lessonApi as any).updateWithOptionalFiles(
          this.lessonId,
          payload,
          { document: this.selectedDoc || undefined },
          this.sharepointPaths
        )
      : (this.lessonApi as any).createWithOptionalFiles(
          payload,
          { document: this.selectedDoc || undefined },
          this.sharepointPaths
        );

    req$.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/lessons']);
        },
        error: (e: any) => {
          this.saving.set(false);
          this.loadError.set(e?.message || 'Save failed. Please try again.');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
