import { Component } from '@angular/core';
import { CoreService } from 'src/app/core/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/core/services/message.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService, 
    private _auth: AuthService,
    private _message : MessageService,
    public _router : Router

  ) {
    _auth.authenticatedUser$.pipe(
      tap(user => {
        if(user) _router.navigate([user.roles[0].toLowerCase(), 'dashboard'])
      })
    ).subscribe()
  }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if(!this.form.valid) return;
    this._auth.login(this.form.value).subscribe(
      (response : any)=>{
        this._auth.saveAuthToLS(response.data)
        this._auth.setAuthUser(response.data);
        this._auth.redirectUser();
        this._message.showSuccessMessage(response.message)
        // this._router.navigate(['/starter'])
      }
    );
  }
}
