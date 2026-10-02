import { Component, Inject, OnInit, Optional } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'document-preview-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './document-preview-dialog.component.html',
  styleUrl: './document-preview-dialog.component.scss'
})
export class DocumentPreviewDialog implements OnInit{
  
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ){}

  ngOnInit(): void {
  }
}
