import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventInfoTechModalComponent } from './event-info-tech-modal.component';

describe('EventInfoTechModalComponent', () => {
  let component: EventInfoTechModalComponent;
  let fixture: ComponentFixture<EventInfoTechModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventInfoTechModalComponent]
    });
    fixture = TestBed.createComponent(EventInfoTechModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
