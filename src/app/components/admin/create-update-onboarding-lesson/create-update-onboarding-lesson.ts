import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { Lesson } from '../../../interfaces/lesson.interface';
import { LessonApiService } from '../../../services/lesson.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-create-update-onboarding-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './create-update-onboarding-lesson.html',
  styleUrl: './create-update-onboarding-lesson.scss',
})
export class CreateUpdateOnboardingLesson implements OnDestroy{
  @Input() isEdit = false;
  @Input() lessonId?: string;
  ngUnsubscribe: Subject<any> = new Subject();
  lesson: Lesson = {
    title: '',
    shortDescription: '',
    description: '',
    questions: [],
  };

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['image', 'link'],
      [{ 'align': [] }],
      [{ 'header': [1, 2, 3, false] }],
    ],
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
    },
  };
  constructor(private route: ActivatedRoute, private lessonApi: LessonApiService) { }

  ngOnInit() {
    this.lessonId = this.route.snapshot.paramMap.get('id') as any;
    this.isEdit = !!this.lessonId;
    if (this.isEdit && this.lessonId) {
      this.lessonApi.getLesson(this.lessonId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => (this.lesson = data),
        error: (err) => console.error('❌ Failed to load lesson', err),
      });
    }
  }

  addQuestion() {
    this.lesson.questions.push({
      questionText: '',
      answers: [
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
      ],
    });
  }

  removeQuestion(index: number) {
    this.lesson.questions.splice(index, 1);
  }

  setCorrectAnswer(questionIndex: number, answerIndex: number) {
    this.lesson.questions[questionIndex].answers.forEach((ans, i) => {
      ans.isCorrect = i === answerIndex;
    });
  }

  onSubmit() {
    if (this.isEdit && this.lessonId) {
      this.lessonApi.updateLesson(this.lessonId, this.lesson)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => console.log('✅ Lesson updated successfully'),
        error: (err) => console.error('❌ Update failed', err),
      });
    } else {
      this.lessonApi.createLesson(this.lesson)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => console.log('✅ Lesson created successfully'),
        error: (err) => console.error('❌ Creation failed', err),
      });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
