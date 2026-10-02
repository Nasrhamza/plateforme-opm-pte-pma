import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from 'src/app/core/services/users.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { EMPTY, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-client-review-project-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './client-review-project-dialog.component.html',
  styleUrl: './client-review-project-dialog.component.scss'
})
export class ClientReviewProjectDialogComponent {

  constructor(
    private _authService : AuthService,
    private _projectService : ProjectService,
    private _message : MessageService,
    public dialogRef: MatDialogRef<ClientReviewProjectDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  nq1 : number | null = null;
  nq2 : number | null = null;
  nq3 : number | null = null;
  nq4 : number | null = null;
  nq5 : number | null = null;

  ngOnInit(): void {
  }

  handleRatingSubmit(event : any, question : string){
    switch (question) {
      case 'q1':
        this.nq1 = event*0.2;
        break;
      case 'q2':
        this.nq2 = event*0.2;
        break;
      case 'q3':
        this.nq3 = event*0.1;
        break;
      case 'q4':
        this.nq4 = event*0.2;
        break;
      case 'q5':
        this.nq5 = event*0.3;
      break;
    }
  }

  submit(){
    if(!this.data._id){
      this._message.showErrorMessage('Invalid project, please try again');
      return;  
    }
    if(this.nq1 == null || this.nq2 == null || this.nq3 == null  ||  this.nq4 == null ||  this.nq5 == null){
      this._message.showErrorMessage('Please answer all questions');
      return;  
    }
    this._authService.authenticatedUser$.pipe(
      take(1),
      switchMap(user =>{
        if(!user || user.roles[0] != "Client"){
          this._message.showErrorMessage('You\'re not allowed to note this project');
          return EMPTY;
        }
        const noteClient = this.nq1! + this.nq2! + this.nq3! + this.nq4! + this.nq5!;
        return this._projectService.noteProject(this.data._id, user.id, +noteClient.toFixed(1))
      })
    ).subscribe(
      res=>{
        this.dialogRef.close({ data : res.data, action :'update' })
        this._message.showSuccessMessage(res.message);
      }
    )
  }
  }
