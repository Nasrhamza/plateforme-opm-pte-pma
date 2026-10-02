import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.sass'],
  providers:[ToastrService]

})
export class ResetComponent implements OnInit {

  ChangePasswordForm!: FormGroup;
  submitted = false;
  error = '';


  constructor(  private formBuilder: FormBuilder ,
    private toastr:ToastrService, 
    private authService : AuthService,
    private router :Router) {}

    ngOnInit(): void {
      this.ChangePasswordForm = this.formBuilder.group({
       password: ['',Validators.required],
       Cpassword: ['',Validators.required],
      })
    }  

    get f() {
      return this.ChangePasswordForm.controls;
    }
  
    onSubmit(){
      this.submitted = true;
      this.error = '';
      
      let pass = this.f['password'].value
      if (this.ChangePasswordForm.invalid) {
        this.error = 'Invalid email !';
        this.submitted= false;
        return;
      } else {
       this.authService.changePassword(pass)
       this.toastr.success("Password changed", "Success");
      }
    }

}
