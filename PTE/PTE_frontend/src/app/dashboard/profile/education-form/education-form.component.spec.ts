import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationFormComponent } from './education-form.component';

describe('EducationFormComponent', () => {
  let component: EducationFormComponent;
  let fixture: ComponentFixture<EducationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EducationFormComponent]
    });
    fixture = TestBed.createComponent(EducationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
