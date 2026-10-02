import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCommentsComponent } from './all-comments.component';

describe('AllCommentsComponent', () => {
  let component: AllCommentsComponent;
  let fixture: ComponentFixture<AllCommentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllCommentsComponent]
    });
    fixture = TestBed.createComponent(AllCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
