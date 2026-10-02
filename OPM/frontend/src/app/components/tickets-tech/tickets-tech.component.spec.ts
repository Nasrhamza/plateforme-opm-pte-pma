import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsTechComponent } from './tickets-tech.component';

describe('TicketsTechComponent', () => {
  let component: TicketsTechComponent;
  let fixture: ComponentFixture<TicketsTechComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketsTechComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketsTechComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
