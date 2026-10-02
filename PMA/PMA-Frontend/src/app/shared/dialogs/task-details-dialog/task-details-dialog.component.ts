import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { environment } from 'src/environments/environment.development';
import { TasksService } from 'src/app/core/services/tasks.service';
import { Task } from 'src/app/core/models/task.model';

@Component({
  selector: 'app-task-details-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './task-details-dialog.component.html',
  styleUrl: './task-details-dialog.component.scss'
})
export class TaskDetailsDialogComponent implements OnInit{

  task : Task | null = null;
  imagesUrl = environment.userImagesUrl;
  
  constructor(
    private _taskService : TasksService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TaskDetailsDialogComponent>,
  ){}

  ngOnInit(): void {
    if(!this.data) return;
    this._taskService.findById(this.data.id).subscribe(
      res => {
        this.task = res.data!;
      }
    )
  }
}
