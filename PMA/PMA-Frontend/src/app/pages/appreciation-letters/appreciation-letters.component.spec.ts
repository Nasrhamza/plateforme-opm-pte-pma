import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppreciationLettersComponent } from './appreciation-letters.component';

describe('AppreciationLettersComponent', () => {
  let component: AppreciationLettersComponent;
  let fixture: ComponentFixture<AppreciationLettersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppreciationLettersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppreciationLettersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
