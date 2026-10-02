import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluateTaskDialogComponent } from './evaluate-task-dialog.component';

describe('EvaluateTaskDialogComponent', () => {
  let component: EvaluateTaskDialogComponent;
  let fixture: ComponentFixture<EvaluateTaskDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluateTaskDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluateTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
