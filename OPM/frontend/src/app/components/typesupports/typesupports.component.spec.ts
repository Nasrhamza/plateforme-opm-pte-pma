import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesupportsComponent } from './typesupports.component';

describe('TypesupportsComponent', () => {
  let component: TypesupportsComponent;
  let fixture: ComponentFixture<TypesupportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypesupportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypesupportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
