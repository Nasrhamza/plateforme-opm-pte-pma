import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsTasksComponent } from './project-details-tasks.component';

describe('ProjectDetailsTasksComponent', () => {
  let component: ProjectDetailsTasksComponent;
  let fixture: ComponentFixture<ProjectDetailsTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
