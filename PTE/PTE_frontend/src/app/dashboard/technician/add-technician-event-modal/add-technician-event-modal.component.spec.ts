import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTechnicianEventModalComponent } from './add-technician-event-modal.component';

describe('AddTechnicianEventModalComponent', () => {
  let component: AddTechnicianEventModalComponent;
  let fixture: ComponentFixture<AddTechnicianEventModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTechnicianEventModalComponent]
    });
    fixture = TestBed.createComponent(AddTechnicianEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
