import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateOnboardingLesson } from './create-update-onboarding-lesson';

describe('CreateUpdateOnboardingLesson', () => {
  let component: CreateUpdateOnboardingLesson;
  let fixture: ComponentFixture<CreateUpdateOnboardingLesson>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateOnboardingLesson]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateOnboardingLesson);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
