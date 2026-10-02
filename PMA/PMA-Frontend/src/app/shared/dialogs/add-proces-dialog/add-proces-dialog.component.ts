import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from 'src/app/core/services/users.service';
import { RisksService } from 'src/app/core/services/risks.service';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/services/project.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { EMPTY, switchMap } from 'rxjs';
import { ProcesService } from 'src/app/core/services/proces.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-add-proces-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './add-proces-dialog.component.html',
  styleUrl: './add-proces-dialog.component.scss'
})
export class AddProcesDialogComponent {

  constructor(
    private _user : UserService,
    private _authService : AuthService,
    private _projectService : ProjectService,
    private _procesService : ProcesService,
    private _fb : FormBuilder,
    private _message : MessageService,
    public dialogRef: MatDialogRef<AddProcesDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  form : FormGroup;
  projects : Project[] = [];
  users : User[] = [];
  loading = false;

  fetchProjects(){
    this._authService.authenticatedUser$.pipe(
      switchMap(user => {
        if(!user) return EMPTY;
        return this._projectService.findAll({ TeamLeader : user.id })
      })
    ).subscribe(
      res=>{
        this.projects = res.data!.projects!;
      }
    )
    
  }

  ngOnInit(): void {
    this.fetchProjects();
    this.fetchUsers();

    this.form = this._fb.group({
      Titre : ['', Validators.required],
      Type_Communication : ['', Validators.required],
      description : [''],
      Project : ['', [Validators.required]],
      equipe : ['', [Validators.required, Validators.minLength(1)]],
    })
    if(this.data.action == 'update'){
      this._procesService.findById(this.data._id).subscribe(
        res => {
          this.form.patchValue({ 
            Titre : res.data!.Titre, 
            Type_Communication : res.data!.Type_Communication,
            description : res.data!.description,
            Project : res.data!.Project._id,
            equipe : res.data!.equipe.map(u => u._id)
          });
        }
      );
    }    
  }

  get f(){
    return this.form.controls;
  }

  fetchUsers(){
    this._user.findAll({ roles : ['Engineer', 'Team Leader'] }).subscribe(
      res=>{
        this.users = res.data!.users!
      }
    )
  }

  submit(){
    if(!this.form.valid) {
      this._message.showErrorMessage('Please provide all fields');
      return;
    }
    this.loading = true;
    if(this.data.action === 'Add'){
      this._authService.authenticatedUser$.pipe(
        switchMap(user => {
          if(!user) return EMPTY;
          return this._procesService.add({Sender : user.id, ...this.form.value})
        })
      ).subscribe(
        res => {
          this.loading = false;
          this.dialogRef.close({ data : res.data, action :'add' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }else{
      this._procesService.update(this.data._id, this.form.value).subscribe(
        res => {
          this.loading = false;
          this.dialogRef.close({ data : res.data, action :'update' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }
  }
}
