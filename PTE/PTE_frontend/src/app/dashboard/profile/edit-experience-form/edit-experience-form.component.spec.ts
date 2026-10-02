import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExperienceFormComponent } from './edit-experience-form.component';

describe('EditExperienceFormComponent', () => {
  let component: EditExperienceFormComponent;
  let fixture: ComponentFixture<EditExperienceFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditExperienceFormComponent]
    });
    fixture = TestBed.createComponent(EditExperienceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
