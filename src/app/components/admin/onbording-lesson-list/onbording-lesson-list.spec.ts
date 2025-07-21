import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnbordingLessonList } from './onbording-lesson-list';

describe('OnbordingLessonList', () => {
  let component: OnbordingLessonList;
  let fixture: ComponentFixture<OnbordingLessonList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnbordingLessonList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnbordingLessonList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
