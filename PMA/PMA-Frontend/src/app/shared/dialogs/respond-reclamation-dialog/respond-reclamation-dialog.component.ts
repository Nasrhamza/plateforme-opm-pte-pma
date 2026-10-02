import { Component, Inject, Optional } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { EMPTY, switchMap } from 'rxjs';
import { ReclamationService } from 'src/app/core/services/reclamation.service';

@Component({
  selector: 'app-respond-reclamation-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './respond-reclamation-dialog.component.html',
  styleUrl: './respond-reclamation-dialog.component.scss'
})
export class RespondReclamationDialogComponent {

  constructor(
    private _authService : AuthService,
    private _reclamationService : ReclamationService,
    private _message : MessageService,
    public dialogRef: MatDialogRef<RespondReclamationDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  comment : FormControl;

  ngOnInit(): void {
    this.comment = new FormControl('', Validators.required);
    this.fetchReclamtion()
  }

  fetchReclamtion(){
    this._reclamationService.findById(this.data.id).subscribe(
      res=>{
        this.comment.patchValue(res.data?.reponse);
      }
    )
  }


  submit(){
    if(!this.comment.valid) {
      this._message.showErrorMessage('Please write a valid response');
      return;
    }
    this._authService.authenticatedUser$.pipe(
      switchMap(user => {
        if(!user) return EMPTY;
        if(!user.roles.includes('Team Leader')){
          this._message.showErrorMessage('You\'re not authorizd to add a comment to this reclamation');
          return EMPTY
        };
        return this._reclamationService.respondToReclamation(this.data.id, this.comment.value)
      })
    ).subscribe(
      res => {
        this.dialogRef.close({ data : res.data })
        this._message.showSuccessMessage(res.message);
      }
    )
  }
}
