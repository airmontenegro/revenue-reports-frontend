import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingTopicPage } from './onboarding-topic-page';

describe('OnboardingTopicPage', () => {
  let component: OnboardingTopicPage;
  let fixture: ComponentFixture<OnboardingTopicPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingTopicPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingTopicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
