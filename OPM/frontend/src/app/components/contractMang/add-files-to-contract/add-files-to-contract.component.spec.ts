import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFilesToContractComponent } from './add-files-to-contract.component';

describe('AddFilesToContractComponent', () => {
  let component: AddFilesToContractComponent;
  let fixture: ComponentFixture<AddFilesToContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFilesToContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFilesToContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
