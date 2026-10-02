import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoomEventModalComponent } from './add-room-event-modal.component';

describe('AddRoomEventModalComponent', () => {
  let component: AddRoomEventModalComponent;
  let fixture: ComponentFixture<AddRoomEventModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddRoomEventModalComponent]
    });
    fixture = TestBed.createComponent(AddRoomEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
