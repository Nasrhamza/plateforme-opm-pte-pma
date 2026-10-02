import { Component, Inject, OnInit, Optional } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TasksService } from 'src/app/core/services/tasks.service';
import { MessageService } from 'src/app/core/services/message.service';

@Component({
  selector: 'app-change-task-progress-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './change-task-progress-dialog.component.html',
  styleUrl: './change-task-progress-dialog.component.scss'
})
export class ChangeTaskProgressDialogComponent implements OnInit {

  constructor(
    private _message : MessageService,
    private _task : TasksService,
    public dialogRef: MatDialogRef<ChangeTaskProgressDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  progress = 0;
  loading = false;


  ngOnInit(): void {
    this.fetchTask()    
  }

  fetchTask(){
    this._task.findById(this.data._id).subscribe(
      res=>{
        this.progress = res.data?.progress!
      }
    )
  }

  submit(){
    this.loading = true;
    this._task.changeTaskProgress(this.data._id, this.progress).subscribe(
      res => {
        this.loading = false;
        this.dialogRef.close({ data : res.data, action :'update' })
        this._message.showSuccessMessage(res.message);
      }
    )
  }

  formatLabel(value: number): string {
    return `${value}`;
  }
}
