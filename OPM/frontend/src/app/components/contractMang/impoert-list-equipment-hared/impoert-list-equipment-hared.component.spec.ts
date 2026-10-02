import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpoertListEquipmentHaredComponent } from './impoert-list-equipment-hared.component';

describe('ImpoertListEquipmentHaredComponent', () => {
  let component: ImpoertListEquipmentHaredComponent;
  let fixture: ComponentFixture<ImpoertListEquipmentHaredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpoertListEquipmentHaredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpoertListEquipmentHaredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
