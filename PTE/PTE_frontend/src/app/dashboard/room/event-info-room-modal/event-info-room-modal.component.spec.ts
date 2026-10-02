import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventInfoRoomModalComponent } from './event-info-room-modal.component';

describe('EventInfoRoomModalComponent', () => {
  let component: EventInfoRoomModalComponent;
  let fixture: ComponentFixture<EventInfoRoomModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventInfoRoomModalComponent]
    });
    fixture = TestBed.createComponent(EventInfoRoomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
