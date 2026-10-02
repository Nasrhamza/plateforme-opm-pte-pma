import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoClanderComponent } from './info-clander.component';

describe('InfoClanderComponent', () => {
  let component: InfoClanderComponent;
  let fixture: ComponentFixture<InfoClanderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoClanderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoClanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
