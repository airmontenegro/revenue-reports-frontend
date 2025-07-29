import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { LessonApiService, UserProgress } from '../../services/lesson.service';
import { UpdateUserProgressPayload, UserProgressPayload, UserProgressService } from '../../services/user-progress.service';
import { FormsModule } from '@angular/forms';
import { map, Subject, switchMap, takeUntil } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from "../../pipes/safe-html-pipe";
@Component({
  selector: 'app-onboarding-stepper',
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  templateUrl: './onboarding-stepper.html',
  styleUrl: './onboarding-stepper.scss'
})
export class OnboardingStepper implements OnDestroy {
  currentStep = 0;
  steps: any[] = [];
  isLoading = true;
  userProgress: UserProgress[] = [];
  ngUnsubscribe: Subject<any> = new Subject();
  constructor(
    private lessonApi: LessonApiService,
    private progressService: UserProgressService
  ) { }

  ngOnInit(): void {
    this.progressService.getProgress().pipe(
      switchMap((progressList: UserProgress[]) => {
        console.log('📥 Retrieved progress list:', progressList);
        this.userProgress = progressList;
        return this.lessonApi.getAllLessons().pipe(
          map((lessons) => {
            console.log('📚 Retrieved lessons:', lessons);

            const steps = lessons.map((lesson) => {
              const userProgress = progressList.find(
                (p: UserProgress) => p.lesson.id === lesson.id
              );
              console.log(`🔍 Progress for lesson [${lesson.title}]`, userProgress);

              return {
                id: lesson.id,
                title: lesson.title,
                content: lesson.description,
                questions: lesson.questions.map((q: any) => {

                  const matchedAnswer = userProgress?.answers?.find((a: any) => {
                    console.log('🔍 Checking', a.questionId, 'vs', q.id);
                    return a.questionId === q.id;
                  });

                  console.log(
                    `❓ Question [${q.questionText}]`,
                    '→ Matched answer:',
                    matchedAnswer
                  );

                  return {
                    questionId: q.id,
                    questionText: q.questionText,
                    answers: q.answers,
                    selectedAnswerId: matchedAnswer?.selectedAnswerId || null
                  };
                })
              };
            });

            console.log('✅ Final steps with mapped progress:', steps);
            return steps;
          })
        );
      }), takeUntil(this.ngUnsubscribe)
    ).subscribe((steps) => {
      this.steps = steps;
      this.isLoading = false;
      console.log('🎬 Steps loaded into component state');
    });
  }

  nextStep() {
    this.submitProgress();
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitProgress() {
    const step = this.steps[this.currentStep];

    const answers = step.questions.map((q: any) => ({
      questionId: q.questionId,
      selectedAnswerId: q.selectedAnswerId
    }));

    const existing = this.userProgress.find(p => p.lesson.id === step.id);

    const hasChanges = existing
      ? step.questions.some(
        (q: { questionId: string; selectedAnswerId: string }) => {
          const stored = existing.answers.find(a => a.questionId === q.questionId);
          return stored?.selectedAnswerId !== q.selectedAnswerId;
        }
      )
      : false;

    let request$ = null;

    if (!existing) {
      const createPayload: UserProgressPayload = {
        lessonId: step.id,
        isCompleted: true,
        answers
      };
      request$ = this.progressService.submitProgress(createPayload);
    } else if (hasChanges) {
      const updatePayload: UpdateUserProgressPayload = {
        isCompleted: true,
        answers
      };
      request$ = this.progressService.updateProgress(step.id, updatePayload);
    }

    if (request$) {
      request$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        alert('Progress saved!');
      });
    }
  }

  isStepCompleted(step: any): boolean {
    return step.questions.every((q: any) => q.selectedAnswerId);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
