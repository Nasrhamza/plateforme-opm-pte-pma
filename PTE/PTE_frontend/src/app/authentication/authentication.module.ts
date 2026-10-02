import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { SigninComponent } from './signin/signin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup/signup.component';
import { FeatherModule } from 'angular-feather';
import {
  Facebook,
  Twitter,
  Github,
  Gitlab,
  User,
  Key,
  UserCheck,
  Mail,
} from 'angular-feather/icons';
import { ForgotComponent } from './forgot/forgot.component';
import { Page500Component } from './page500/page500.component';
import { Page404Component } from './page404/page404.component';
import { ResetComponent } from './reset/reset.component';
import { CodeComponent } from './code/code.component';
import { ToastrModule } from 'ngx-toastr';

const icons = {
  Facebook,
  Twitter,
  Github,
  Gitlab,
  User,
  Key,
  UserCheck,
  Mail,
};

@NgModule({
  declarations: [SigninComponent, SignupComponent, ForgotComponent, Page500Component, Page404Component, ResetComponent, CodeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    FeatherModule.pick(icons),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left'
    }),
  ],
})
export class AuthenticationModule {}
