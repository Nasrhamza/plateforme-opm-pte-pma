import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTechEventComponent } from './edit-tech-event.component';

describe('EditTechEventComponent', () => {
  let component: EditTechEventComponent;
  let fixture: ComponentFixture<EditTechEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditTechEventComponent]
    });
    fixture = TestBed.createComponent(EditTechEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
