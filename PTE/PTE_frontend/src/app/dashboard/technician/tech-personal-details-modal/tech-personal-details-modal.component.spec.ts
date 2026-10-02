import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechPersonalDetailsModalComponent } from './tech-personal-details-modal.component';

describe('TechPersonalDetailsModalComponent', () => {
  let component: TechPersonalDetailsModalComponent;
  let fixture: ComponentFixture<TechPersonalDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TechPersonalDetailsModalComponent]
    });
    fixture = TestBed.createComponent(TechPersonalDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
