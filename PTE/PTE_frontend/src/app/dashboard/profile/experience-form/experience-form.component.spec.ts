import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceFormComponent } from './experience-form.component';

describe('ExperienceFormComponent', () => {
  let component: ExperienceFormComponent;
  let fixture: ComponentFixture<ExperienceFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExperienceFormComponent]
    });
    fixture = TestBed.createComponent(ExperienceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
