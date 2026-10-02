import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedInternComponent } from './selected-intern.component';

describe('SelectedInternComponent', () => {
  let component: SelectedInternComponent;
  let fixture: ComponentFixture<SelectedInternComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectedInternComponent]
    });
    fixture = TestBed.createComponent(SelectedInternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
