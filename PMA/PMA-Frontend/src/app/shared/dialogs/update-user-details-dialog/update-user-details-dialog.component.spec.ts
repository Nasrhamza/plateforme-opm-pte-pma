import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserDetailsDialogComponent } from './update-user-details-dialog.component';

describe('UpdateUserDetailsDialogComponent', () => {
  let component: UpdateUserDetailsDialogComponent;
  let fixture: ComponentFixture<UpdateUserDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateUserDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateUserDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
