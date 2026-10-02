import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavRightComponent } from './ht.component';

describe('NavRightComponent', () => {
  let component: NavRightComponent;
  let fixture: ComponentFixture<NavRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
