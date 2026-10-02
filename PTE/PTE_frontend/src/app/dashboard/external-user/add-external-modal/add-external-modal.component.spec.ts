import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExternalModalComponent } from './add-external-modal.component';

describe('AddExternalModalComponent', () => {
  let component: AddExternalModalComponent;
  let fixture: ComponentFixture<AddExternalModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExternalModalComponent]
    });
    fixture = TestBed.createComponent(AddExternalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
