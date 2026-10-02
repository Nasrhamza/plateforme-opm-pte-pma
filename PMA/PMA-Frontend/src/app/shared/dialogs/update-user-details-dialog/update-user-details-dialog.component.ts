import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/core/services/users.service';
import { EMPTY, switchMap, take } from 'rxjs';
import { AuthResponse } from 'src/app/core/models/auth-response.model';

@Component({
  selector: 'app-update-user-details-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './update-user-details-dialog.component.html',
  styleUrl: './update-user-details-dialog.component.scss'
})
export class UpdateUserDetailsDialogComponent implements OnInit{

  form : FormGroup;
  loading = false;
  
  constructor(
    private _fb : FormBuilder,
    private _auth : AuthService,
    private _user : UserService,
    private _message : MessageService,
    public dialogRef: MatDialogRef<UpdateUserDetailsDialogComponent>,
  ){}

  ngOnInit(): void {
    this.form = this._fb.group({
      fullName : ['', Validators.required],
      phone : ['', Validators.required],
      address : [''],
      DateOfBirth : [''],
    });

    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user =>{
        if(!user) return EMPTY;
        return this._user.findById(user.id)
      })
    ).subscribe(
      res => {
        this.form.patchValue({ 
          fullName : res.data!.fullName,
          phone : res.data!.phone,
          DateOfBirth : res.data!.DateOfBirth,
          address : res.data!.address ? res.data!.address : '',
         })
      }
    )
  }

  get f(){
    return this.form.controls
  }

  onSubmit(){
    this.loading = true;
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user => {
        if(!user) return EMPTY;
        return this._user.updateProfile(user?.id, this.form.value)
      })
    ).subscribe(
      res => {
        this.loading = false;
        this._message.showSuccessMessage(res.message);
        let authUserOld =  this._auth.getAuthUser() as AuthResponse;
        this._auth.setAuthUser({ 
          ...authUserOld, 
          fullName : `${res.data?.fullName}`
         });
        this._auth.saveAuthToLS(authUserOld);
        this.dialogRef.close({ event : res.data })
      }
    )
  }

}
