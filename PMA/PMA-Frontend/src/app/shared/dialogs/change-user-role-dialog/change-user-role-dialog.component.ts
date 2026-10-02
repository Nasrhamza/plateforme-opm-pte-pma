import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from 'src/app/core/services/users.service';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/services/project.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { EMPTY, switchMap } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { TasksService } from 'src/app/core/services/tasks.service';

@Component({
  selector: 'app-change-user-role-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './change-user-role-dialog.component.html',
  styleUrl: './change-user-role-dialog.component.scss'
})
export class ChangeUserRoleDialogComponent {

  constructor(
    private _user : UserService,
    private _message : MessageService,
    public dialogRef: MatDialogRef<ChangeUserRoleDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  role:FormControl;

  ngOnInit(): void {
    this.role = new FormControl('', Validators.required)
    this.role.patchValue(this.data.role[0])
  }

  submit(){
    if(!this.role.valid) {
      this._message.showErrorMessage('Please provide a valid role');
      return;
    }
    this._user.changeRole(this.data.id, this.role.value).subscribe(
      res => {
        this.dialogRef.close({ data : res.data, action :'update' })
        this._message.showSuccessMessage(res.message);
      }
    )
  }
}
