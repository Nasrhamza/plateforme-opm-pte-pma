import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAndUpdateContractComponent } from './add-and-update-contract.component';

describe('AddAndUpdateContractComponent', () => {
  let component: AddAndUpdateContractComponent;
  let fixture: ComponentFixture<AddAndUpdateContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAndUpdateContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAndUpdateContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
