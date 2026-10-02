import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.scss'
})
export class ConfirmDeleteDialogComponent {

  constructor(
    private _dialogRef : MatDialogRef<ConfirmDeleteDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  doAction(){
    this._dialogRef.close({ event: { data : this.data, answer : true } });
  }

  closeDialog(): void {
    this._dialogRef.close({ event : { data : this.data, answer : false } });
  }
}
