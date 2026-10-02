import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFileCardComponent } from './project-file-card.component';

describe('ProjectFileCardComponent', () => {
  let component: ProjectFileCardComponent;
  let fixture: ComponentFixture<ProjectFileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFileCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
