import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-information-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './information-dialog.component.html',
  styleUrl: './information-dialog.component.scss'
})
export class InformationDialogComponent {
constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<InformationDialogComponent>,
    ){
      this.title = data.title;
    }

    title : string = 'Information';

}
