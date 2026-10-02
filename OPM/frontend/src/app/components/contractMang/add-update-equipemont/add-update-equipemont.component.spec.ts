import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateEquipemontComponent } from './add-update-equipemont.component';

describe('AddUpdateEquipemontComponent', () => {
  let component: AddUpdateEquipemontComponent;
  let fixture: ComponentFixture<AddUpdateEquipemontComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateEquipemontComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateEquipemontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
