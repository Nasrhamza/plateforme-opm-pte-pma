import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardItemComponent } from './forward-item.component';

describe('ForwardItemComponent', () => {
  let component: ForwardItemComponent;
  let fixture: ComponentFixture<ForwardItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForwardItemComponent]
    });
    fixture = TestBed.createComponent(ForwardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
