import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/service/auth.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.sass'],
  providers:[ToastrService]

})
export class ForgotComponent implements OnInit {
  emailSendForm!: FormGroup;
  submitted = false;
  error = '';
  user!:any


  constructor(  private formBuilder: FormBuilder , 
                private userService:UserServiceService,
                private authService : AuthService,
                private toastr:ToastrService,
                private router :Router) {}

  ngOnInit(): void {
    this.emailSendForm = this.formBuilder.group({
     email: ['',[Validators.required, Validators.email, Validators.minLength(5)]],
    })
  }
  get f() {
    return this.emailSendForm.controls;
  }

  onSubmit(){
    this.submitted = true;
    this.error = '';
    
     //let email= {email:this.f['email'].value};
    
    if (this.emailSendForm.invalid) {
      this.error = 'Invalid email !';
      this.submitted= false;
      return;
    }
    else {
      this.userService.getUserByEmail(this.emailSendForm.value.email).subscribe(res=>{
        this.user = res
        this.authService.sendCode(this.emailSendForm.value.email); 
      },
      (error)=>{
        this.toastr.error("User Not found");
      }
      )
    }
  }
}

