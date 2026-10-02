import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveDocComponent } from './leave-doc.component';

describe('LeaveDocComponent', () => {
  let component: LeaveDocComponent;
  let fixture: ComponentFixture<LeaveDocComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveDocComponent]
    });
    fixture = TestBed.createComponent(LeaveDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
