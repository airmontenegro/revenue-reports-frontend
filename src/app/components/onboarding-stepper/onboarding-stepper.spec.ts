import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingStepper } from './onboarding-stepper';

describe('OnboardingStepper', () => {
  let component: OnboardingStepper;
  let fixture: ComponentFixture<OnboardingStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingStepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingStepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
