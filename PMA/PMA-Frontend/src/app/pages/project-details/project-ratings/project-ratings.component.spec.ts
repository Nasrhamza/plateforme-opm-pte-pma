import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRatingsComponent } from './project-ratings.component';

describe('ProjectRatingsComponent', () => {
  let component: ProjectRatingsComponent;
  let fixture: ComponentFixture<ProjectRatingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRatingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
