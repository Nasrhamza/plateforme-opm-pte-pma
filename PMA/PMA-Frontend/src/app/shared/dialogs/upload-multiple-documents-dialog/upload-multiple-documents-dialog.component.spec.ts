import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMultipleDocumentsDialogComponent } from './upload-multiple-documents-dialog.component';

describe('UploadDocumentDialogComponent', () => {
  let component: UploadMultipleDocumentsDialogComponent;
  let fixture: ComponentFixture<UploadMultipleDocumentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadMultipleDocumentsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadMultipleDocumentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
