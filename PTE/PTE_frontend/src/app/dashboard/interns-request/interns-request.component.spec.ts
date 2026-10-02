import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternsRequestComponent } from './interns-request.component';

describe('InternsRequestComponent', () => {
  let component: InternsRequestComponent;
  let fixture: ComponentFixture<InternsRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternsRequestComponent]
    });
    fixture = TestBed.createComponent(InternsRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
