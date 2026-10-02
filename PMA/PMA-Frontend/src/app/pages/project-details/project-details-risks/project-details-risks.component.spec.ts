import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsRisksComponent } from './project-details-risks.component';

describe('ProjectDetailsRisksComponent', () => {
  let component: ProjectDetailsRisksComponent;
  let fixture: ComponentFixture<ProjectDetailsRisksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsRisksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsRisksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
