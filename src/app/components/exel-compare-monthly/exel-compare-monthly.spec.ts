import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExelCompareMonthly } from './exel-compare-monthly';

describe('ExelCompareMonthly', () => {
  let component: ExelCompareMonthly;
  let fixture: ComponentFixture<ExelCompareMonthly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExelCompareMonthly]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExelCompareMonthly);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
