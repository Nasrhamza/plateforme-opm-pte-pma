import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedUserResultComponent } from './selected-user-result.component';

describe('SelectedUserResultComponent', () => {
  let component: SelectedUserResultComponent;
  let fixture: ComponentFixture<SelectedUserResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectedUserResultComponent]
    });
    fixture = TestBed.createComponent(SelectedUserResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
