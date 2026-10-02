import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleStatComponent } from './vehicle-stat.component';

describe('VehicleStatComponent', () => {
  let component: VehicleStatComponent;
  let fixture: ComponentFixture<VehicleStatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VehicleStatComponent]
    });
    fixture = TestBed.createComponent(VehicleStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
