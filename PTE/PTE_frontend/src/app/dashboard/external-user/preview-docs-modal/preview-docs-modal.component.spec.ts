import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDocsModalComponent } from './preview-docs-modal.component';

describe('PreviewDocsModalComponent', () => {
  let component: PreviewDocsModalComponent;
  let fixture: ComponentFixture<PreviewDocsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviewDocsModalComponent]
    });
    fixture = TestBed.createComponent(PreviewDocsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
