import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from 'src/app/core/services/users.service';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/services/project.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { EMPTY, switchMap } from 'rxjs';
import { ReclamationService } from 'src/app/core/services/reclamation.service';

@Component({
  selector: 'app-add-reclamation-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './add-reclamation-dialog.component.html',
  styleUrl: './add-reclamation-dialog.component.scss'
})
export class AddReclamationDialogComponent {

  constructor(
    private _authService : AuthService,
    private _projectService : ProjectService,
    private _reclamationService : ReclamationService,
    private _fb : FormBuilder,
    private _message : MessageService,
    public dialogRef: MatDialogRef<AddReclamationDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  form : FormGroup;
  projects : Project[] = [];
  loading = false;

  fetchProjects(){
    this._authService.authenticatedUser$.pipe(
      switchMap(user => {
        if(!user) return EMPTY;
        return this._projectService.findAll({ client : user.id })
      })
    ).subscribe(
      res=>{
        this.projects = res.data!.projects!;
      }
    )    
  }

  ngOnInit(): void {
    this.fetchProjects();

    this.form = this._fb.group({
      Title : ['', Validators.required],
      Comment : ['', Validators.required],
      reponse : [''],
      Type_Reclamation : ['', Validators.required],
      project : ['', [Validators.required]],
      status : ['', [Validators.required, Validators.minLength(1)]],
    })
    if(this.data.action == 'update'){
      this._reclamationService.findById(this.data._id).subscribe(
        res => {
          this.form.patchValue({ 
            Title : res.data!.Title, 
            Comment : res.data!.Comment,
            reponse : res.data!.reponse,
            status : res.data!.status,
            project : res.data!.project._id,
          });
        }
      );
    }    
    if(this.data.selectedProject){
      this.form.patchValue({ project : this.data.selectedProject })
    }
  }

  get f(){
    return this.form.controls;
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
          if(!user.roles.includes('Client')) return EMPTY;
          return this._reclamationService.add({ client : user.id, ...this.form.value})
        })
      ).subscribe(
        res => {
          this.loading = false;
          this.dialogRef.close({ data : res.data, action :'add' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }else{
      this._reclamationService.update(this.data._id, this.form.value).subscribe(
        res => {
          this.dialogRef.close({ data : res.data, action :'update' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }
  }
}
