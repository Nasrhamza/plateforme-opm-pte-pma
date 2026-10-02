import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkRequestsComponent } from './network-requests.component';

describe('NetworkRequestsComponent', () => {
  let component: NetworkRequestsComponent;
  let fixture: ComponentFixture<NetworkRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkRequestsComponent]
    });
    fixture = TestBed.createComponent(NetworkRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
