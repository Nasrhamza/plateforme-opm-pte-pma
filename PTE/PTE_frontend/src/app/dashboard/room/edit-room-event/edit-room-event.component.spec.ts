import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoomEventComponent } from './edit-room-event.component';

describe('EditRoomEventComponent', () => {
  let component: EditRoomEventComponent;
  let fixture: ComponentFixture<EditRoomEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditRoomEventComponent]
    });
    fixture = TestBed.createComponent(EditRoomEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
