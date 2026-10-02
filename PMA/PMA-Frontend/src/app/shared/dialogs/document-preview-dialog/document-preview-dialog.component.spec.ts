import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPreviewDialog } from './document-preview-dialog.component';

describe('UserDetailsDialogComponent', () => {
  let component: DocumentPreviewDialog;
  let fixture: ComponentFixture<DocumentPreviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentPreviewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentPreviewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
