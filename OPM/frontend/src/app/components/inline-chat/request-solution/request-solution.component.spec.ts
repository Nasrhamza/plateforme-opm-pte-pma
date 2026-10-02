import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSolutionComponent } from './request-solution.component';

describe('RequestSolutionComponent', () => {
  let component: RequestSolutionComponent;
  let fixture: ComponentFixture<RequestSolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestSolutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
