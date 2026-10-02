import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CoreService } from 'src/app/core/services/core.service';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit{
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService, 
    private _router: Router,
    private _auth : AuthService,
    private _activatedRoute : ActivatedRoute,
    private _message : MessageService,
  ) { }

  form = new FormGroup({
    code: new FormControl(''),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmNewPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this._activatedRoute.paramMap.pipe(
      tap((params : any) => {
        this.form.patchValue({ code : params.params.code })
      })
    ).subscribe();
  }

  submit() {
    const code = this.f.code.value!;
    const newPassword = this.f.newPassword.value?.trim();
    const confirmNewPassword = this.f.confirmNewPassword.value?.trim();
    if(!newPassword || !confirmNewPassword) return;
    this._auth.resetPassword({ code, newPassword, confirmNewPassword }).subscribe(
      (res : any) => {
        this._router.navigate(['/auth']);
        this._message.showSuccessMessage(res.message)
      },
    );
  }
}
