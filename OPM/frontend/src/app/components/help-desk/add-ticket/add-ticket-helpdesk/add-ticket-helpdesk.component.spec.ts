import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTicketHelpdeskComponent } from './add-ticket-helpdesk.component';

describe('AddTicketHelpdeskComponent', () => {
  let component: AddTicketHelpdeskComponent;
  let fixture: ComponentFixture<AddTicketHelpdeskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTicketHelpdeskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTicketHelpdeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
