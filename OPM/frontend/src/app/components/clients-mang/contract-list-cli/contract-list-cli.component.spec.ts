import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractListCliComponent } from './contract-list-cli.component';

describe('ContractListCliComponent', () => {
  let component: ContractListCliComponent;
  let fixture: ComponentFixture<ContractListCliComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractListCliComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractListCliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
