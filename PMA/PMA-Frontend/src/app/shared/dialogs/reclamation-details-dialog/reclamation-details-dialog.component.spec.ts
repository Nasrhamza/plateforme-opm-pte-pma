import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationDetailsDialogComponent } from './reclamation-details-dialog.component';

describe('ReclamationDetailsDialogComponent', () => {
  let component: ReclamationDetailsDialogComponent;
  let fixture: ComponentFixture<ReclamationDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamationDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
