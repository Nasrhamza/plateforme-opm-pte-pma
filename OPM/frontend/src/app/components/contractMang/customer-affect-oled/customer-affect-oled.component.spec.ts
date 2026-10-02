import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAffectOledComponent } from './customer-affect-oled.component';

describe('CustomerAffectOledComponent', () => {
  let component: CustomerAffectOledComponent;
  let fixture: ComponentFixture<CustomerAffectOledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerAffectOledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAffectOledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
