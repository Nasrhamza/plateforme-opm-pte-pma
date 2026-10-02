import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestApprovalModalComponent } from './request-approval-modal.component';

describe('RequestApprovalModalComponent', () => {
  let component: RequestApprovalModalComponent;
  let fixture: ComponentFixture<RequestApprovalModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestApprovalModalComponent]
    });
    fixture = TestBed.createComponent(RequestApprovalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
