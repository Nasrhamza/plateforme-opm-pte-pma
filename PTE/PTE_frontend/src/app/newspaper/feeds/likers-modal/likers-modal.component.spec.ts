import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikersModalComponent } from './likers-modal.component';

describe('LikersModalComponent', () => {
  let component: LikersModalComponent;
  let fixture: ComponentFixture<LikersModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LikersModalComponent]
    });
    fixture = TestBed.createComponent(LikersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
