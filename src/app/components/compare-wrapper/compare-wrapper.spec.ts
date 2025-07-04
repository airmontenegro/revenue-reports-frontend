import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareWrapper } from './compare-wrapper';

describe('CompareWrapper', () => {
  let component: CompareWrapper;
  let fixture: ComponentFixture<CompareWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareWrapper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareWrapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
