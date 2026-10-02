import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsFilesComponent } from './project-details-files.component';

describe('ProjectDetailsFilesComponent', () => {
  let component: ProjectDetailsFilesComponent;
  let fixture: ComponentFixture<ProjectDetailsFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
