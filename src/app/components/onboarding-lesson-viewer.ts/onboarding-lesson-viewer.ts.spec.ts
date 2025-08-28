import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingLessonViewerTs } from './onboarding-lesson-viewer.ts';

describe('OnboardingLessonViewerTs', () => {
  let component: OnboardingLessonViewerTs;
  let fixture: ComponentFixture<OnboardingLessonViewerTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingLessonViewerTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingLessonViewerTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
