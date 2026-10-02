import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { SharedModule } from '../../shared/shared.module';
import { DurationRatingPillsComponent } from 'src/app/components/duration-rating-pills/duration-rating-pills.component';
import { RatingTypes } from 'src/app/core/helpers/rating.helpers';

@Component({
  selector: 'app-define-task-weight-dialog2',
  standalone: true,
  imports: [
    SharedModule,
    DurationRatingPillsComponent
  ],
  templateUrl: './define-task-weight-dialog2.component.html',
  styleUrl: './define-task-weight-dialog2.component.scss'
})
export class DefineTaskWeightDialog2Component implements OnInit {

  
    constructor(
      private _taskService : TasksService,
      public dialogRef: MatDialogRef<DefineTaskWeightDialog2Component>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private _message : MessageService
    ){}

    ratingTypes = RatingTypes;
  
    nq1 : number  = 0;
    nq2 : number = 0;
    nq3 : number  = 0;
    nq4 : number  = 0;
    nq5 : number  = 0;
    loading = false;
  
    ngOnInit(): void {
      
    }
  
    handleAnswerSelect(event : any, question : string){
      switch (question) {
        case 'q1':
          this.nq1 = event*0.4;
          break;
        case 'q2':
          this.nq2 = event*0.3;
          break;
        case 'q3':
          this.nq3 = event*0.15;
          break;
        case 'q4':
          this.nq4 = event*0.1;
          break;
        case 'q5':
          this.nq5 = event*0.05;
        break;
      }
    }
  
    submit(){
      this.loading = true;
      const taskWeight = this.nq1 + this.nq2 + this.nq3 + this.nq4 + this.nq5;
      this._taskService.defineTaskRatingWeight(this.data.task._id, +taskWeight.toPrecision(1)).subscribe(
        res => {
          this.loading = false;
          this._message.showSuccessMessage(res.message);
          this.dialogRef.close({ event : res.data });
        }
      );
    }
}
