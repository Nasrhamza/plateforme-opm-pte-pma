import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDetailsSectionComponent } from './site-details-section.component';

describe('SiteDetailsSectionComponent', () => {
  let component: SiteDetailsSectionComponent;
  let fixture: ComponentFixture<SiteDetailsSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteDetailsSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteDetailsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
