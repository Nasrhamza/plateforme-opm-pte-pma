import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSkillsFormComponent } from './edit-skills-form.component';

describe('EditSkillsFormComponent', () => {
  let component: EditSkillsFormComponent;
  let fixture: ComponentFixture<EditSkillsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSkillsFormComponent]
    });
    fixture = TestBed.createComponent(EditSkillsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
