import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyOrganigrammeComponent } from './company-organigramme.component';

describe('CompanyOrganigrammeComponent', () => {
  let component: CompanyOrganigrammeComponent;
  let fixture: ComponentFixture<CompanyOrganigrammeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyOrganigrammeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyOrganigrammeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
