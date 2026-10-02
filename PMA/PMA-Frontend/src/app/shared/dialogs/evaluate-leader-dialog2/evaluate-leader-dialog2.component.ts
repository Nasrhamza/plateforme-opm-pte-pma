import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { Ratingfaces } from 'src/app/components/rating-faces/rating-faces.component';
import { questionsLabels, RatingTypes } from 'src/app/core/helpers/rating.helpers';
import { ProjectService } from 'src/app/core/services/project.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-evaluate-leader-dialog2',
  standalone: true,
  imports: [
    SharedModule,
    Ratingfaces
  ],
  templateUrl: './evaluate-leader-dialog2.component.html',
  styleUrl: './evaluate-leader-dialog2.component.scss'
})
export class EvaluateLeaderDialog2 implements OnInit {

  
    constructor(
      private _projectService : ProjectService,
      public dialogRef: MatDialogRef<EvaluateLeaderDialog2>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private _message : MessageService,
      private _authService : AuthService,
    ){
      this.evaluationType = this.data.evaluatuionType
    }
  
    nq1 : number  = 0;
    nq2 : number = 0;
    nq3 : number  = 0;
    nq4 : number  = 0;
    nq5 : number  = 0;
    loading = false;
    ratingTypes = RatingTypes;
    evaluationType : string;
    labels = questionsLabels.find((x : any) => x.evaluationType === 'managerNote').labels;
  
    managerNote : number  = 0;
    userId : string;
    role : string;
  
    ngOnInit(): void {
      this._authService.authenticatedUser$.subscribe(
        user => {
          if(!user) return;
          this.userId = user.id;
          this.role = user.roles[0];
        }
      )
    }
  
    handleAnswer(event : any, question : string){
      switch (question) {
        case 'q1':
          this.nq1 = event/5 * 20;
          break;
        case 'q2':
          this.nq2 = event/5 * 20;
          break;
        case 'q3':
          this.nq3 = event/5 * 20;
          break;
        case 'q4':
          this.nq4 = event/5 * 20;
          break;
        case 'q5':
          this.nq5 = event/5 * 20;
        break;
      }
    }
  
    submit(){
      this.loading = true;
      const note = this.nq1 + this.nq2 + this.nq3 + this.nq4 + this.nq5;
      this._projectService.memberEvaluateTeamLeader(this.data.projectId, this.userId, note).subscribe(
        res => {
          this.loading = false;
          this._message.showSuccessMessage(res.message);
          this.dialogRef.close({ event : res.data });
        }
      );
    }
}
