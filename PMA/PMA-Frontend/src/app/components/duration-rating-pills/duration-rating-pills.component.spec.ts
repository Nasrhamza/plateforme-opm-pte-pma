import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationRatingPillsComponent } from './duration-rating-pills.component';

describe('DurationRatingPillsComponent', () => {
  let component: DurationRatingPillsComponent;
  let fixture: ComponentFixture<DurationRatingPillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationRatingPillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DurationRatingPillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
