import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, EMPTY, map, switchMap, tap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { ProjectTimelineComponent } from 'src/app/components/project-timeline/project-timeline.component';
import { Project } from 'src/app/core/models/project.model';
import { Task } from 'src/app/core/models/task.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { AddtaskDialogComponent } from 'src/app/shared/dialogs/add-task-dialog/add-task-dialog.component';
import { ChangeTaskProgressDialogComponent } from 'src/app/shared/dialogs/change-task-progress-dialog/change-task-progress-dialog.component';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { DefineTaskWeightDialog2Component } from 'src/app/shared/dialogs/define-task-weight-dialog2/define-task-weight-dialog2.component';
import { EvaluateTaskDialog2 } from 'src/app/shared/dialogs/evaluate-task-dialog2/evaluate-task-dialog2.component';
import { ExportTasksDialog } from 'src/app/shared/dialogs/export-tasks-dialog/export-tasks-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-project-details-tasks',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent,
    ProjectTimelineComponent
  ],
  templateUrl: './project-details-tasks.component.html',
  styleUrl: './project-details-tasks.component.scss'
})
export class ProjectDetailsTasksComponent {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  
  constructor(
    private _taskService : TasksService,
    public dialog: MatDialog,
    public _message: MessageService,
    private _auth : AuthService,
    private _route : ActivatedRoute,
    private _router : Router,
    
  ){}
  
  imagesUrl = environment.userImagesUrl;
  projectId : string |null = null;
  project : Project | null = null;
  displayedColumns: string[] = ['ref','title','priority','progress','status','timeline','actions'];
  tasks : Task[] = [];
  projects : Project[] = [];
  filteredTasks : Task[] = [];
  dataSource : MatTableDataSource<any> = new MatTableDataSource<any>();
  role = '';
  currentUserId = '';
  showEditButton = false;
  searchInput: FormControl;
  loading = false;


  ngOnInit(): void {
    //get the project id reactively 
    this.searchInput = new FormControl('');
    this._route.parent!.paramMap.pipe(
      map((params) => {
        if(params) {
          this.projectId = params.get('projectId') ?? null;
        }
      }
    )).subscribe();
    this._auth.authenticatedUser$.pipe(
      tap(user =>{
        if(user){
          this.role = user.roles[0];
          this.currentUserId = user.id;
        }
      })
    ).subscribe()
    this.handleSearch();
    this.fetchTasks();
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  handleSearch(){
    this.searchInput.valueChanges.pipe(
      debounceTime(300),
      tap(value => {
        this.filteredTasks = this.tasks.filter(t => t.Title.toLowerCase().includes(value.toLowerCase()))
        this.refreshMatTable(this.filteredTasks);
      })
    ).subscribe()
  }

  onlyExecutorCanSee(task : Task){
    return task.Executor.map(t => t._id).includes(this.currentUserId);
  }

  addTask(action : 'Add' | 'update', obj : any){
    obj.action = action;
    obj.projectId = this.projectId;
    const dialogRef = this.dialog.open(AddtaskDialogComponent, { data : obj, minWidth : '600px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.tasks = [result.data, ...this.tasks];
          this.filteredTasks = this.tasks;
        }
        if(result.action == 'update'){
          const index = this.tasks.findIndex(e => e._id === obj._id)
          this.tasks[index] = result.data;
          this.filteredTasks = [...this.tasks];
        }
        this.refreshMatTable(this.filteredTasks);
      }
    });
  }

  export(){
    const dialogRef = this.dialog.open(ExportTasksDialog, { data : { dataExport : this.filteredTasks }, minWidth : '700px' });
  }

  updateProgress(id : string){
    const dialogRef = this.dialog.open(ChangeTaskProgressDialogComponent, { data : { _id : id }, width : '400px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        const index = this.tasks.findIndex(e => e._id === result.data._id)
        this.tasks[index] = result.data;
        this.filteredTasks = [...this.tasks];
        this.refreshMatTable(this.filteredTasks);
      }
    });
  }

  fetchTasks(){
    this.loading = true;
    if(!this.projectId) return;
    this._auth.authenticatedUser$.pipe(
      switchMap(user => {
        if(!user) return EMPTY;
        if(!this.projectId) return EMPTY;
        if( ['Admin', 'Client', 'Engineer'].includes(user.roles[0]) ) return this._taskService.findAll({ Project : this.projectId })
        if(user.roles[0] == "Team Leader") return this._taskService.findAll({ Project : this.projectId, TeamLeader : user.id })
              return EMPTY;
        })).subscribe(
            res => {
              this.tasks = res.data!.tasks!;
              this.filteredTasks = this.tasks;
              this.refreshMatTable(this.filteredTasks);
              this.loading = false;
      }
    )   
  }

  delete(id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._taskService.delete(result.event.data).subscribe(
          res => {
            this._message.showSuccessMessage(res.message);
            this.tasks = this.tasks.filter(c => c._id !== res.data!._id);
            this.filteredTasks = this.tasks;
            this.refreshMatTable(this.filteredTasks);
          }
        )
      })
  }

  showDetails(id : any){
    // this.dialog.open(TaskDetailsDialogComponent, { data : { id }, width : '700px' });
    this._router.navigate(['tasks', id])
  }

  evaluateTask(task : Task){
      const dialogRef = this.dialog.open(EvaluateTaskDialog2, { data : { task }, minWidth : '600px', maxWidth : '700px' });
      dialogRef.afterClosed().subscribe(
        result => {
          const index = this.tasks.findIndex(t => t._id === task._id);
          this.tasks[index].note = result.event.note;
          this.filteredTasks = this.tasks;
          this.refreshMatTable(this.filteredTasks);
        }
      )
    }

    setRatingWight(task : Task){
      const dialogRef = this.dialog.open(DefineTaskWeightDialog2Component, { data : { task }, minWidth : '600px', maxWidth : '800px' });
      dialogRef.afterClosed().subscribe(
        result => {
          const index = this.tasks.findIndex(t => t._id === task._id);
          this.tasks[index].ratingWeight = result.event.rating;
          this.filteredTasks = this.tasks;
          this.refreshMatTable(this.filteredTasks);
        }
      )
    }

  refreshMatTable(newData : Task[]){
    this.dataSource = new MatTableDataSource<Task>(newData);
    this.dataSource.paginator = this.paginator;
  }
}
