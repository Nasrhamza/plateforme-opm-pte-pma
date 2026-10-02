import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffecteTeamsComponent } from './affecte-teams.component';

describe('AffecteTeamsComponent', () => {
  let component: AffecteTeamsComponent;
  let fixture: ComponentFixture<AffecteTeamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffecteTeamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffecteTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
