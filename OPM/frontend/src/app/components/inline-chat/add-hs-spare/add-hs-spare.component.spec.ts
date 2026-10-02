import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHsSpareComponent } from './add-hs-spare.component';

describe('AddHsSpareComponent', () => {
  let component: AddHsSpareComponent;
  let fixture: ComponentFixture<AddHsSpareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddHsSpareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHsSpareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
