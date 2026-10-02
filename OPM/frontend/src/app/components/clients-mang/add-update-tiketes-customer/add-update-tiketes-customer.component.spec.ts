import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateTiketesCustomerComponent } from './add-update-tiketes-customer.component';

describe('AddUpdateTiketesCustomerComponent', () => {
  let component: AddUpdateTiketesCustomerComponent;
  let fixture: ComponentFixture<AddUpdateTiketesCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateTiketesCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateTiketesCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
