import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaisenCancelTiketesComponent } from './raisen-cancel-tiketes.component';

describe('RaisenCancelTiketesComponent', () => {
  let component: RaisenCancelTiketesComponent;
  let fixture: ComponentFixture<RaisenCancelTiketesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaisenCancelTiketesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaisenCancelTiketesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
