import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { environment } from 'src/environments/environment.development';
import { MatTableDataSource } from '@angular/material/table';
import { Task } from 'src/app/core/models/task.model';
import { TableUtil } from './tableUtil';

@Component({
  selector: 'app-export-tasks-dialog',
  standalone: true,
  imports: [
    SharedModule,
  ],
  templateUrl: './export-tasks-dialog.component.html',
  styleUrl: './export-tasks-dialog.component.scss'
})
export class ExportTasksDialog implements OnInit{

  dataExport : any | null = null;
  imagesUrl = environment.userImagesUrl;
  dataSource : MatTableDataSource<Task> = new MatTableDataSource<Task>();
  
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ExportTasksDialog>,
  ){
    this.dataSource = new MatTableDataSource<Task>(data.dataExport);
  }

  ngOnInit(): void {
  }

  exportTable() {
    TableUtil.exportTableToExcel("tasks_table_export");
  }

  displayedColumns: string[] = ['title', 'priority','project','status', 'start', 'deadline', 'closed', 'details', 'executor'];
}
