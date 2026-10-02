import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTiketesCustomerComponent } from './list-tiketes-customer.component';

describe('ListTiketesCustomerComponent', () => {
  let component: ListTiketesCustomerComponent;
  let fixture: ComponentFixture<ListTiketesCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTiketesCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTiketesCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
