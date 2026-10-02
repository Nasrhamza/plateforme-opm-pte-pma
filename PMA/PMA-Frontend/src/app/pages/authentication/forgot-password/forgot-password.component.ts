import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoreService } from 'src/app/core/services/core.service';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  options = this.settings.getOptions();

  constructor(
    private settings: CoreService, 
    private _router: Router,
    private _auth : AuthService,
    private _message : MessageService,
  ) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    const email = this.f.email.value?.trim();
    if(!email) return;
    this._auth.forgotPassword(email).subscribe(
      (res : any) => {
        this._router.navigate(['/auth/verify-code', { exp : res.data.expiration }]);
        this._message.showSuccessMessage(res.message);
      },
    );
  }
}
