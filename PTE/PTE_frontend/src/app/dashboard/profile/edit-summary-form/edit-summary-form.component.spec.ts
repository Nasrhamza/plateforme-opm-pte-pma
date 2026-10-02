import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSummaryFormComponent } from './edit-summary-form.component';

describe('EditSummaryFormComponent', () => {
  let component: EditSummaryFormComponent;
  let fixture: ComponentFixture<EditSummaryFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSummaryFormComponent]
    });
    fixture = TestBed.createComponent(EditSummaryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
