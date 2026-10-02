import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTaskProgressDialogComponent } from './change-task-progress-dialog.component';

describe('ChangeTaskProgressDialogComponent', () => {
  let component: ChangeTaskProgressDialogComponent;
  let fixture: ComponentFixture<ChangeTaskProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeTaskProgressDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeTaskProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
