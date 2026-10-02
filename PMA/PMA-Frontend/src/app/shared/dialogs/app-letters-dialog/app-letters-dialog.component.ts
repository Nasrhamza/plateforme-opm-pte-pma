import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProjectFileCardComponent } from 'src/app/components/project-file-card/project-file-card.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: '/app-letters-dialog',
  standalone: true,
  imports: [
    SharedModule,
    ProjectFileCardComponent
  ],
  templateUrl: './app-letters-dialog.component.html',
  styleUrl: './app-letters-dialog.component.scss'
})
export class AppLettersDialogComponent implements OnInit{
  
  constructor(
    public dialogRef: MatDialogRef<AppLettersDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){
    // this.pdfFile = `${this.filesUrl}/${data.file}`;
    console.log("requested pdf file = ", this.pdfFile)
  }
  filesUrl = environment.filesUrl;

  letters : any[] = [];
  pdfFile = this.filesUrl+"/25-10-2023--Prologic Sawssen Certificate of Appreciation.pdf"

  ngOnInit(): void {
  }
}
