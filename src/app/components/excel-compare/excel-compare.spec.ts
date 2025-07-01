import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelCompare } from './excel-compare';

describe('ExcelCompare', () => {
  let component: ExcelCompare;
  let fixture: ComponentFixture<ExcelCompare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelCompare]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelCompare);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
