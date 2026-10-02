import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateHealthcheckComponent } from './add-update-healthcheck.component';

describe('AddUpdateHealthcheckComponent', () => {
  let component: AddUpdateHealthcheckComponent;
  let fixture: ComponentFixture<AddUpdateHealthcheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateHealthcheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateHealthcheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
