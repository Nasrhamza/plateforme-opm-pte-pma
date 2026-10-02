import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateSupportComponent } from './add-update-support.component';

describe('AddUpdateSupportComponent', () => {
  let component: AddUpdateSupportComponent;
  let fixture: ComponentFixture<AddUpdateSupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateSupportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
