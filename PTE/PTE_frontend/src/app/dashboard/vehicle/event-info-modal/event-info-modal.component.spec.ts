import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventInfoModalComponent } from './event-info-modal.component';

describe('EventInfoModalComponent', () => {
  let component: EventInfoModalComponent;
  let fixture: ComponentFixture<EventInfoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventInfoModalComponent]
    });
    fixture = TestBed.createComponent(EventInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
