import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSpareComponent } from './update-spare.component';

describe('UpdateSpareComponent', () => {
  let component: UpdateSpareComponent;
  let fixture: ComponentFixture<UpdateSpareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateSpareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateSpareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
