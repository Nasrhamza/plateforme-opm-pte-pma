import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessoryTypeComponent } from './accessory-type.component';

describe('AccessoryTypeComponent', () => {
  let component: AccessoryTypeComponent;
  let fixture: ComponentFixture<AccessoryTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessoryTypeComponent]
    });
    fixture = TestBed.createComponent(AccessoryTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
