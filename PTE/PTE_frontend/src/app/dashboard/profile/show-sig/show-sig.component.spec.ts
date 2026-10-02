import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSigComponent } from './show-sig.component';

describe('ShowSigComponent', () => {
  let component: ShowSigComponent;
  let fixture: ComponentFixture<ShowSigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowSigComponent]
    });
    fixture = TestBed.createComponent(ShowSigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
