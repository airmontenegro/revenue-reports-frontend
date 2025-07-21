import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingWrapper } from './onboarding-wrapper';

describe('OnboardingWrapper', () => {
  let component: OnboardingWrapper;
  let fixture: ComponentFixture<OnboardingWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingWrapper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingWrapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
