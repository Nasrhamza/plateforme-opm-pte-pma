import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEducationFormComponent } from './edit-education-form.component';

describe('EditEducationFormComponent', () => {
  let component: EditEducationFormComponent;
  let fixture: ComponentFixture<EditEducationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditEducationFormComponent]
    });
    fixture = TestBed.createComponent(EditEducationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
