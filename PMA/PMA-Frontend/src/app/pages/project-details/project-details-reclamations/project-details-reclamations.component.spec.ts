import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsReclamationsComponent } from './project-details-reclamations.component';

describe('ProjectDetailsReclamationsComponent', () => {
  let component: ProjectDetailsReclamationsComponent;
  let fixture: ComponentFixture<ProjectDetailsReclamationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsReclamationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsReclamationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
