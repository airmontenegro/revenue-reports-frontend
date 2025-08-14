import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryCreateUpdate } from './category-create-update';

describe('CategoryCreateUpdate', () => {
  let component: CategoryCreateUpdate;
  let fixture: ComponentFixture<CategoryCreateUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryCreateUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryCreateUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
