import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GasCardComponent } from './gas-card.component';

describe('GasCardComponent', () => {
  let component: GasCardComponent;
  let fixture: ComponentFixture<GasCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GasCardComponent]
    });
    fixture = TestBed.createComponent(GasCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
