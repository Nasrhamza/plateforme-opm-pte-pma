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
import { EMPTY, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-add-risk-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './add-risk-dialog.component.html',
  styleUrl: './add-risk-dialog.component.scss'
})
export class AddRiskDialogComponent {

  constructor(
    private _user : UserService,
    private _authService : AuthService,
    private _projectService : ProjectService,
    private _riskService : RisksService,
    private _fb : FormBuilder,
    private _message : MessageService,
    public dialogRef: MatDialogRef<AddRiskDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  form : FormGroup;
  projects : Project[] = [];
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

    this.form = this._fb.group({
      title : ['', Validators.required],
      action : ['', Validators.required],
      impact : ['', Validators.required],
      details : ['', Validators.required],
      date : ['', [Validators.required]],
      project : ['', [Validators.required]],
      user : ['', [Validators.required, Validators.minLength(1)]],
    })
    if(this.data.action == 'Add'){
      this._authService.authenticatedUser$.pipe(
        tap(user =>{
          this.form.patchValue({ user : user?.id })
        })
      ).subscribe();
    }
    if(this.data.action == 'update'){
      this._riskService.findById(this.data._id).subscribe(
        res => {
          this.form.patchValue({ 
            title : res.data!.title, 
            action : res.data!.action,
            impact : res.data!.impact,
            details : res.data!.details,
            date : res.data!.date,
            project : res.data!.project._id,
          });
        }
      );
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
      this._riskService.add(this.form.value).subscribe(
        res => {
          this.loading = false;
          this.dialogRef.close({ data : res.data, action :'add' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }else{
      this._riskService.update(this.data._id, this.form.value).subscribe(
        res => {
          this.loading = false;
          this.dialogRef.close({ data : res.data, action :'update' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }
  }
}
