import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, EMPTY, switchMap, take, tap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { ProjectTimelineComponent } from 'src/app/components/project-timeline/project-timeline.component';
import { Project } from 'src/app/core/models/project.model';
import { Task } from 'src/app/core/models/task.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { AddtaskDialogComponent } from 'src/app/shared/dialogs/add-task-dialog/add-task-dialog.component';
import { ChangeTaskProgressDialogComponent } from 'src/app/shared/dialogs/change-task-progress-dialog/change-task-progress-dialog.component';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';
import { DefineTaskWeightDialog2Component } from 'src/app/shared/dialogs/define-task-weight-dialog2/define-task-weight-dialog2.component';
import { EvaluateTaskDialog2 } from 'src/app/shared/dialogs/evaluate-task-dialog2/evaluate-task-dialog2.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent,
    ProjectTimelineComponent
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _taskService : TasksService,
    public dialog: MatDialog,
    public _message: MessageService,
    private _route : ActivatedRoute,
    private router : Router,
    private _auth : AuthService,
    private _project : ProjectService,
  ){}

  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['ref', 'title','project','priority','progress','status','timeline','actions'];
  tasks : Task[] = [];
  projects : Project[] = [];
  filteredTasks : Task[] = [];
  dataSource : MatTableDataSource<any> = new MatTableDataSource<any>();
  role = '';
  showEditButton = false;
  searchInput: FormControl;
  loading = false;


  ngOnInit(): void {
    this._auth.authenticatedUser$.pipe(
      tap(user => {
        if(user){
          this.role = user.roles[0]
        }
      })
    ).subscribe();
    this.searchInput = new FormControl('');
    this.handleSearch();
    this.fetchTasks();
    this.fetchProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  handleSearch(){
    this.searchInput.valueChanges.pipe(
      debounceTime(300),
      tap(value => {
        if(this.role == 'Admin'){
          this.fetchTasks({Title : value.toLowerCase() })
        }else{
          this.filteredTasks = this.tasks.filter(t => t.Title.toLowerCase().includes(value.toLowerCase()) || t.Project.Projectname.toLowerCase().includes(value.toLowerCase()))
        }
        this.refreshMatTable(this.filteredTasks);
      })
    ).subscribe()
  }

  addTask(action : 'Add' | 'update', obj : any){
    obj.action = action;
    const dialogRef = this.dialog.open(AddtaskDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.tasks = [result.data, ...this.tasks];
          this.filteredTasks = this.tasks;
          //show tasjk rating doalog after it was added successfully
          const dialogRef = this.dialog.open(DefineTaskWeightDialog2Component, { data : { task : result.data }, width : '700px' });
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

  fetchProjects(){
    this._auth.authenticatedUser$.pipe(
      switchMap(user=>{
        if(!user) return EMPTY;
        if(user.roles.includes('Admin')){
          return this._project.findAll()
        }
        if(user.roles.includes('Engineer')){
          return this._project.findAll({ equipe : user.id })
        }
        if(user.roles.includes('Team Leader')){
          return this._project.findAll({ TeamLeader : user.id })
        }
        return EMPTY;
      })
    ).subscribe(
      res=>{
        this.projects = res.data!.projects
      }
    )
  }

  handleProjectSelect(e : any){
    if(e.value == ""){
      this.filteredTasks = this.tasks;
    }else{
      this.filteredTasks = this.tasks.filter(t =>  t.Project._id === e.value);
    }
    this.refreshMatTable(this.filteredTasks)
  }

  fetchTasks(filter? : any){
    this.loading = true;
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user => {
        if(!user ||!user.id) return EMPTY;
        if(user.roles[0] === 'Admin') {
          this.showEditButton = true;
          return this._taskService.findAll(filter)
        }
        if(user.roles[0] === 'Engineer') {
          this.showEditButton = false;
          return this._auth.authenticatedUser$.pipe(
            take(1),
            switchMap(user => {
              if(!user) return EMPTY;
              return this._taskService.findAll({ Executor : user.id, ...filter  })
            })
          )
        }
        if(user.roles[0] === 'Team Leader') {
          this.showEditButton = false;
          return this._auth.authenticatedUser$.pipe(
            take(1),
            switchMap(user => {
              if(!user) return EMPTY;
              return this._taskService.findTasksByTeamLeader(user.id)
            })
          )
        }
        return EMPTY;
      })
    ).subscribe(
      res => {
        this.tasks = res.data!.tasks!;
        this.filteredTasks = this.tasks;
        this.refreshMatTable(this.filteredTasks);
        this.loading = false;
      }
    )    
  }

  // handlePageChange(e : any){
  //   console.log(e)
  //    this.page = e.pageIndex;
  //    this.size = e.pageSize;
  //    this.fetchTasks()
  // }

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
    this.router.navigate(['tasks', id])
  }
  
  setRatingWight(task : Task){
    const dialogRef = this.dialog.open(DefineTaskWeightDialog2Component, { data : { task }, width : '700px' });
    dialogRef.afterClosed().subscribe(
      result => {
        const index = this.tasks.findIndex(t => t._id === task._id);
        this.tasks[index].ratingWeight = result.event.rating;
      }
    )
  }
  
  evaluateTask(task : Task){
    const dialogRef = this.dialog.open(EvaluateTaskDialog2, { data : { task }, width : '700px' });
    dialogRef.afterClosed().subscribe(
      result => {
        const index = this.tasks.findIndex(t => t._id === task._id);
        this.tasks[index].note = result.event.note;
      }
    )
  }

  refreshMatTable(newData : Task[]){
    this.dataSource = new MatTableDataSource<Task>(newData);
    this.dataSource.paginator = this.paginator;
  }
  
}
