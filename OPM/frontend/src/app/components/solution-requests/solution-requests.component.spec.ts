import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionRequestsComponent } from './solution-requests.component';

describe('SolutionRequestsComponent', () => {
  let component: SolutionRequestsComponent;
  let fixture: ComponentFixture<SolutionRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
