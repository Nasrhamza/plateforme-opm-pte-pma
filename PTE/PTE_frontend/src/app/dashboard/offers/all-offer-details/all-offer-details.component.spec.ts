import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllOfferDetailsComponent } from './all-offer-details.component';

describe('AllOfferDetailsComponent', () => {
  let component: AllOfferDetailsComponent;
  let fixture: ComponentFixture<AllOfferDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllOfferDetailsComponent]
    });
    fixture = TestBed.createComponent(AllOfferDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
