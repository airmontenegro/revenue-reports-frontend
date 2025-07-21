import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-onboarding-stepper',
  imports: [CommonModule],
  templateUrl: './onboarding-stepper.html',
  styleUrl: './onboarding-stepper.scss'
})
export class OnboardingStepper {
 currentStep = 0;

  steps = [
    { title: 'Introduction', content: 'Welcome to the employee tutorial! Let’s get started.' },
    { title: 'Policies', content: 'Here are the key company policies you need to know.' },
    { title: 'Tools Setup', content: 'Let’s set up the tools you’ll use every day.' }
  ];

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
}
