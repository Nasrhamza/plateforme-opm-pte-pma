import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportInterventionComponent } from './rapport-intervention.component';

describe('RapportInterventionComponent', () => {
  let component: RapportInterventionComponent;
  let fixture: ComponentFixture<RapportInterventionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RapportInterventionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportInterventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
