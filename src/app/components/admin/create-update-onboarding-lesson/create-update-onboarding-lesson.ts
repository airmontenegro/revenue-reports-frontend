import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { ActivatedRoute } from '@angular/router';
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
  @Input() isEdit = false;
  @Input() lessonId?: string;

  private destroy$ = new Subject<void>();
  submitting = false;

  readonly MAX_TITLE = 120;
  readonly MAX_SHORT = 140;

  form: FormGroup;

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private lessonApi: LessonApiService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(this.MAX_TITLE)]],
      shortDescription: ['', [Validators.required, Validators.maxLength(this.MAX_SHORT)]],
      description: ['', [Validators.required]],
      isDeleted: [false],
    });
  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id') || undefined;
    this.lessonId = this.lessonId ?? id;
    this.isEdit = !!this.lessonId;

    if (this.isEdit && this.lessonId) {
      this.lessonApi.getLesson(this.lessonId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.form.patchValue({
              title: data.title ?? '',
              shortDescription: data.shortDescription ?? '',
              description: data.description ?? '',
              isDeleted: (data as any).isDeleted ?? false,
            });
          },
          error: (e) => console.error('❌ load failed', e),
        });
    }
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const payload = this.form.getRawValue();

    const req$ = this.isEdit && this.lessonId
      ? this.lessonApi.updateLesson(this.lessonId, payload)
      : this.lessonApi.createLesson(payload);

    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.submitting = false; console.log('✅ Saved'); },
      error: (e) => { this.submitting = false; console.error('❌ Save failed', e); },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
  }
}
