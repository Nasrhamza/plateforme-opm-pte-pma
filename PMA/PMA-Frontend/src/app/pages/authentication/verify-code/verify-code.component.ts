import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoreService } from 'src/app/core/services/core.service';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss'
})
export class VerifyCodeComponent{
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService, 
    private _router: Router,
    private _auth : AuthService,
    private _message : MessageService,
  ) { }

  timer$ : any | null = null;

  form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    const code = this.f.code.value;
    if(!code) return;
    this._auth.validateCode(code).subscribe(
      (res : any) => {
        this._router.navigate(['/auth/reset-password', { code : res.data.code }]);
        this._message.showSuccessMessage(res.message);
      }
    );
  }
}
