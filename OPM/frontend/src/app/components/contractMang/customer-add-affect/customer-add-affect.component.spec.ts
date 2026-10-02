import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAddAffectComponent } from './customer-add-affect.component';

describe('CustomerAddAffectComponent', () => {
  let component: CustomerAddAffectComponent;
  let fixture: ComponentFixture<CustomerAddAffectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerAddAffectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAddAffectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
