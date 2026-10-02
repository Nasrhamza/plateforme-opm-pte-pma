import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCertificationFormComponent } from './edit-certification-form.component';

describe('EditCertificationFormComponent', () => {
  let component: EditCertificationFormComponent;
  let fixture: ComponentFixture<EditCertificationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditCertificationFormComponent]
    });
    fixture = TestBed.createComponent(EditCertificationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
