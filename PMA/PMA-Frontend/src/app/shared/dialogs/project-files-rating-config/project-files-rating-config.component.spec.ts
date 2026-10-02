import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFilesRatingConfigComponent } from './project-files-rating-config.component';

describe('ProjectFilesRatingConfigComponent', () => {
  let component: ProjectFilesRatingConfigComponent;
  let fixture: ComponentFixture<ProjectFilesRatingConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFilesRatingConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFilesRatingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
