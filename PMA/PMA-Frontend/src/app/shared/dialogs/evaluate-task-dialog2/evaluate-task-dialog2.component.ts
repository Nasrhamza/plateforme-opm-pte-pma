import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { SharedModule } from '../../shared/shared.module';
import { Ratingfaces } from 'src/app/components/rating-faces/rating-faces.component';
import { questionsLabels, RatingTypes } from 'src/app/core/helpers/rating.helpers';

@Component({
  selector: 'app-evaluate-task-dialog2',
  standalone: true,
  imports: [
    SharedModule,
    Ratingfaces
  ],
  templateUrl: './evaluate-task-dialog2.component.html',
  styleUrl: './evaluate-task-dialog2.component.scss'
})
export class EvaluateTaskDialog2 implements OnInit {

  
    constructor(
      private _taskService : TasksService,
      public dialogRef: MatDialogRef<EvaluateTaskDialog2>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private _message : MessageService
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
    labels = questionsLabels.find((x : any) => x.evaluationType === 'taskScore').labels;
  
    ngOnInit(): void {
      
    }
  
    handleAnswer(event : any, question : string){
      switch (question) {
        case 'q1':
          this.nq1 = event*0.4;
          break;
        case 'q2':
          this.nq2 = event*0.3;
          break;
        case 'q3':
          this.nq3 = event*0.1;
          break;
        case 'q4':
          this.nq4 = event*0.1;
          break;
        case 'q5':
          this.nq5 = event*0.1;
        break;
      }
    }
  
    submit(){
      this.loading = true;
      const note = this.nq1 + this.nq2 + this.nq3 + this.nq4 + this.nq5;
      this._taskService.evaluateTaskCompletion(this.data.task._id, +note.toPrecision(1) ).subscribe(
        res => {
          this.loading = false;
          this._message.showSuccessMessage(res.message);
          this.dialogRef.close({ event : res.data });
        }
      );
    }
}
