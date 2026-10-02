import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY, switchMap, take } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { UserService } from 'src/app/core/services/users.service';
// import { UserService } from 'src/app/core/services/user.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-account-settings-security',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './account-settings-security.component.html',
  styleUrl: './account-settings-security.component.scss'
})
export class AccountSettingsSecurityComponent implements OnInit{

  constructor(
    private _fb : FormBuilder,
    private _user : UserService,
    private _message : MessageService,
    private _auth : AuthService,
  ){}

  form : FormGroup;
  alignhide = true;
  
  ngOnInit(): void {
    this.form = this._fb.group({
      oldPassword : ['', Validators.required],
      newPassword : ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword : ['', [Validators.required, this.passwordMatchValidator.bind(this)]],
    })    
  }

  get f(){
    return this.form.controls;
  }

  onSubmit(){
    const { newPassword, confirmPassword, oldpassword } = this.form.value;
    if(newPassword !== confirmPassword) {
      this._message.showErrorMessage('New password missmatch');
      return;
    }
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(
        user => {
          if(!user) return EMPTY;
          return this._user.updatePassword(user?.id, this.form.value)
        }
      )
    ).subscribe(
      res => {
        this._message.showSuccessMessage(res.message);
        this.form.reset();
      }
    )
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (this.form) {
      return control.value === this.form.get('newPassword')?.value ? null : { passwordMismatch: true };
    }
    return { passwordMismatch: true };
  }

  handlePasswordHide(e : any){
    this.alignhide = !this.alignhide;
    e.preventDefault();
  }

}
