import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EMPTY, map, switchMap, take, tap } from 'rxjs';
import { Task } from 'src/app/core/models/task.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { DefineTaskWeightDialog2Component } from 'src/app/shared/dialogs/define-task-weight-dialog2/define-task-weight-dialog2.component';
import { EvaluateTaskDialog2 } from 'src/app/shared/dialogs/evaluate-task-dialog2/evaluate-task-dialog2.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    SharedModule,
    NgApexchartsModule
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent implements OnInit{

  task : Task;
  imagesUrl = environment.userImagesUrl;
  progressChartOptions : any;

  constructor(
    private _route : ActivatedRoute,
    private _taskService : TasksService,
    private _dialog : MatDialog,
    private _authService : AuthService,
  ){}

  ngOnInit(): void {
    this.fetchTask();
  }

  defineTaskWeight(){
    this._authService.authenticatedUser$.pipe(
      take(1),
      tap(user=>{
        if(user && user.roles[0] == 'Team Leader' && (!this.task.ratingWeight || this.task.ratingWeight == 0)){
          const dialogRef =  this._dialog.open(DefineTaskWeightDialog2Component, { data : { task :this.task }, width : '700px' })
          dialogRef.afterClosed().subscribe(
            result=>{
              this.task.ratingWeight = result.event.rating;
            }
          )
        }
      })
    ).subscribe();
  }
  evaluatetask(){
    this._authService.authenticatedUser$.pipe(
      take(1),
      tap(user=>{
        if(user && user.roles[0] === 'Team Leader' && this.task.ratingWeight && (!this.task.note || this.task.note == 0) && this.task.progress === 100 && this.task.Status === 'Closed'){
          const dialogRef = this._dialog.open(EvaluateTaskDialog2, { data : { task : this.task }, width : '700px' });
            dialogRef.afterClosed().subscribe(
              result => {
                this.task.note = result.event.note;
              }
            )
        }
      })
    ).subscribe();
  }

  initChart(){
    this.progressChartOptions = {
      series: [this.task?.progress],
      chart: {
        id: 'radial-chart',
        type: 'radialBar',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
      },
      colors: this.task?.Status === 'Completed' ? ['#13DEB9'] : this.task?.Status === 'Pending' ? ['#FFAE1F'] : ['#13DEB9'],
      labels: ['progress'],
    };
  }

  fetchTask(){
    this._route.paramMap.pipe(
      take(1),
      map(params => (params.get('id')) as string),
      switchMap((id : string) => {
        if(!id) return EMPTY;
        return this._taskService.findById(id)
      })
    ).subscribe(
      res=>{
        this.task = res.data!;
        this.initChart();
        this.defineTaskWeight(); 
        this.evaluatetask();
      }
    );
  }

}
