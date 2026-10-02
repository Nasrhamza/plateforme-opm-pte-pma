import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateSitesComponent } from './add-update-sites.component';

describe('AddUpdateSitesComponent', () => {
  let component: AddUpdateSitesComponent;
  let fixture: ComponentFixture<AddUpdateSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
