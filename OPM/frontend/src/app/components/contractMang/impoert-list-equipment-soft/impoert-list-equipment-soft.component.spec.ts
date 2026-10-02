import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpoertListEquipmentSoftComponent } from './impoert-list-equipment-soft.component';

describe('ImpoertListEquipmentSoftComponent', () => {
  let component: ImpoertListEquipmentSoftComponent;
  let fixture: ComponentFixture<ImpoertListEquipmentSoftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpoertListEquipmentSoftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpoertListEquipmentSoftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
