import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdatevisitPrevComponent } from './add-updatevisit-prev.component';

describe('AddUpdatevisitPrevComponent', () => {
  let component: AddUpdatevisitPrevComponent;
  let fixture: ComponentFixture<AddUpdatevisitPrevComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdatevisitPrevComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdatevisitPrevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
