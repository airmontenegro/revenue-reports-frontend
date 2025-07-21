import { Component } from '@angular/core';
import { OnboardingStepper } from '../onboarding-stepper/onboarding-stepper';

@Component({
  selector: 'app-onboarding-wrapper',
  imports: [OnboardingStepper],
  templateUrl: './onboarding-wrapper.html',
  styleUrl: './onboarding-wrapper.scss'
})
export class OnboardingWrapper {

}
