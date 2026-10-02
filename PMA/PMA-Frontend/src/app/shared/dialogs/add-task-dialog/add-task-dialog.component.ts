import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from 'src/app/core/services/users.service';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/services/project.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { debounceTime, EMPTY, pipe, switchMap, take, tap } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { TasksService } from 'src/app/core/services/tasks.service';

@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './add-task-dialog.component.html',
  styleUrl: './add-task-dialog.component.scss'
})
export class AddtaskDialogComponent {

  constructor(
    private _user : UserService,
    private _authService : AuthService,
    private _projectService : ProjectService,
    private _taskService : TasksService,
    private _fb : FormBuilder,
    private _message : MessageService,
    public dialogRef: MatDialogRef<AddtaskDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  form : FormGroup;
  projects : Project[] = [];
  engineers : User[] = [];
  loading = false;
  currentRole: string;
  showTime : boolean = false;

  fetchProjects(){
    this._authService.authenticatedUser$.pipe(
      switchMap(user => {
        if(!user) return EMPTY;
        this.currentRole = user.roles[0];
        if(user.roles[0] === 'Admin'){
          return this._projectService.findAll()
        }
        return this._projectService.findAll({ TeamLeader : user.id })
      })
    ).subscribe(
      res=>{
        this.projects = res.data!.projects!;
      }
    )    
  }
  ngOnInit(): void {
    this.form = this._fb.group({
      Title : ['', Validators.required],
      Project : ['', Validators.required],
      Executor : ['', [Validators.required, Validators.minLength(1)]],
      companions : [''],
      StartDate : ['', this.data.action == 'Add' ? Validators.required : null ],
      Deadline : ['', this.data.action == 'Add' ? Validators.required : null ],
      Priority : ['', Validators.required],
      Details : ['', [Validators.required]],
      startTime : ['00:00'],
      deadlineTime : ['23:59'],
    });
    this.fetchProjects();

    this.form.valueChanges.pipe(
      debounceTime(500),
      switchMap(value=>{
        const projectId = value.Project;
        if(projectId){
          return this._projectService.getEquipeByProject(projectId)
        }
        return EMPTY;
      })
    ).subscribe(
      res=>{
        this.engineers = res.data;
      }
    );   
    if(this.data.action == 'update'){
      this._taskService.findById(this.data._id).subscribe(
        res => {
          this.showTime = true;
          this.form.patchValue({ 
            Title : res.data!.Title, 
            Project : res.data!.Project._id,
            Executor : res.data!.Executor.map(u => u._id),
            companions : res.data!.companions?.map(u => u._id),
            StartDate : res.data!.StartDate,
            Deadline : res.data!.Deadline,
            Priority : res.data!.Priority,
            Details : res.data!.Details,
            startTime : this.formatTime(new Date(res.data!.StartDate)),
            deadlineTime : this.formatTime(new Date(res.data!.Deadline)),
          });
        }
      );
    };
    if(this.data.projectId){
      this.form.patchValue({ Project : this.data.projectId });
      this._projectService.getEquipeByProject(this.data.projectId).subscribe(
        res=>{
          this.engineers = res.data;
        }
      )

    }
  }

  formatTime(date: Date): string {
    if (!date) return ''; // Handle null or undefined cases
    const hours = date.getHours().toString().padStart(2, '0');  // Ensure two-digit format
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  extractTime(time : string){
    if(!time.trim()) return { hours : 0, minutes : 0 }
    const [hours, minutes] = time.split(':').map(Number);
    return { hours, minutes };
  }

  formatDate(date : Date){
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }

  get f(){
    return this.form.controls;
  }

  submit(){
    if(!this.form.valid) {
      this._message.showErrorMessage('Please provide all fields');
      return;
    }
    //append times to the task start and end date
    const StartDate = new Date(this.form.value.StartDate);
    const Deadline = new Date(this.form.value.Deadline);
    const startTime = this.form.value.startTime;
    const endTime = this.form.value.deadlineTime;
    
    if(startTime){
      StartDate.setHours(this.extractTime(startTime).hours, this.extractTime(startTime).minutes);
    }
    if(endTime){
      Deadline.setHours(this.extractTime(endTime).hours, this.extractTime(endTime).minutes);
    }

    const data = {...this.form.value, StartDate, Deadline };
    this.loading = true;
    if(this.data.action === 'Add'){
      this._taskService.add(data).subscribe(
        res => {
          this.loading = false;
          this.dialogRef.close({ data : res.data, action :'add' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }else{
      this._taskService.update(this.data._id, data).subscribe(
        res => {
          this.loading = false;
          this.dialogRef.close({ data : res.data, action :'update' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }
  }
}
