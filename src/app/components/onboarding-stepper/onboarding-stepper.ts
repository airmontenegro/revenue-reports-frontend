import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { LessonApiService } from '../../services/lesson.service';
import { UserProgressService } from '../../services/user-progress.service';
import { FormsModule } from '@angular/forms';
import { map, Subject, switchMap, takeUntil } from 'rxjs';
import { SafeHtmlPipe } from "../../pipes/safe-html-pipe";
@Component({
  selector: 'app-onboarding-stepper',
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding-stepper.html',
  styleUrl: './onboarding-stepper.scss'
})
export class OnboardingStepper implements OnDestroy {
  currentStep = 0;
  steps: any[] = [];
  isLoading = true;
  ngUnsubscribe: Subject<any> = new Subject();


  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
