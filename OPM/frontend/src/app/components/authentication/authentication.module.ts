import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthSigninModule } from "./auth-signin/auth-signin.module"
import { AuthSignupModule } from "./auth-signup/auth-signup.module"

@NgModule({
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AuthSigninModule,
    AuthSignupModule
  ],
  declarations: [
  ],
})
export class AuthenticationModule { }
