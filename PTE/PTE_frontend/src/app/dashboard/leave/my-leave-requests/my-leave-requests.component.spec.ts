import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLeaveRequestsComponent } from './my-leave-requests.component';

describe('MyLeaveRequestsComponent', () => {
  let component: MyLeaveRequestsComponent;
  let fixture: ComponentFixture<MyLeaveRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyLeaveRequestsComponent]
    });
    fixture = TestBed.createComponent(MyLeaveRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
