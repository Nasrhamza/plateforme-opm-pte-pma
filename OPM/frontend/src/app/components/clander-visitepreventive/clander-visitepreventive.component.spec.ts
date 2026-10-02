import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClanderVisitepreventiveComponent } from './clander-visitepreventive.component';

describe('ClanderVisitepreventiveComponent', () => {
  let component: ClanderVisitepreventiveComponent;
  let fixture: ComponentFixture<ClanderVisitepreventiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClanderVisitepreventiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClanderVisitepreventiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
