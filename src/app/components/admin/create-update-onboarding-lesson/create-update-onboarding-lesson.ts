import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { Lesson } from '../../../interfaces/lesson.interface';
import { LessonApiService } from '../../../services/lesson.service';

@Component({
  selector: 'app-create-update-onboarding-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './create-update-onboarding-lesson.html',
  styleUrl: './create-update-onboarding-lesson.scss',
})
export class CreateUpdateOnboardingLesson {
  @Input() isEdit = false;
  @Input() lessonId?: string;

  lesson: Lesson = {
    title: '',
    shortDescription: '',
    description: '',
    questions: [],
  };

  constructor(private lessonApi: LessonApiService) {}

  ngOnInit() {
    if (this.isEdit && this.lessonId) {
      this.lessonApi.getLesson(this.lessonId).subscribe({
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
      this.lessonApi.updateLesson(this.lessonId, this.lesson).subscribe({
        next: () => console.log('✅ Lesson updated successfully'),
        error: (err) => console.error('❌ Update failed', err),
      });
    } else {
      this.lessonApi.createLesson(this.lesson).subscribe({
        next: () => console.log('✅ Lesson created successfully'),
        error: (err) => console.error('❌ Creation failed', err),
      });
    }
  }
}
