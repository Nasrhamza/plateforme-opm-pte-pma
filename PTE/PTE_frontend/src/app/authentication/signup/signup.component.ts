import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, of } from 'rxjs';
import { AuthService } from 'src/app/core/service/auth.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.sass'],
  providers: [ToastrService],

})
export class SignupComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
 

  error = '';
  constructor(private formBuilder: FormBuilder , 
                private authService : AuthService,
                private router :Router,
                private toastr: ToastrService) {}
  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      fname: ['',Validators.required],
      lname: ['',Validators.required],
      email: ['',[Validators.required, Validators.email, Validators.minLength(5)]],
      gender:['',Validators.required],
      password: ['',[Validators.required, Validators.minLength(8)]],
      Cpassword: ['',[Validators.required, Validators.minLength(8)],this.matchValues('password')],
      hiringdate: ['',Validators.required],
      birthdate: ['',Validators.required],
      fs:['',Validators.required],
      nationality:['',Validators.required],
      departement:['',Validators.required],
      drivingLisence:['',Validators.required],
      address: ['',Validators.required],
      experience: ['',Validators.required],
      phone : ['',[Validators.required,Validators.maxLength(8), Validators.minLength(8)]],
      teamLeader:[false,[Validators.required]],
      termcondition: [false],
      


      // fname: ['',[Validators.required]],
      // lname: ['',[Validators.required]],
      // email: ['',[Validators.required]],
      // gender:['',[Validators.required]],
      // password: ['',[Validators.required]],
      // Cpassword: ['',[Validators.required]],
      // hiringdate: ['',[Validators.required]],
      // birthdate: ['',[Validators.required]],
      // fs:['',[Validators.required]],
      // nationality:['',[Validators.required]],
      // departement:['',[Validators.required]],
      // drivingLisence:['',[Validators.required]],
      // address: ['',[Validators.required]],
      // experience: ['',[Validators.required]],
      // phone : ['',[Validators.required]],
    });
  }
  matchValues(matchTo: string): AsyncValidatorFn  {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      const input = control.value;
      const isValid = control.root.value[matchTo] === input;
      return of(isValid ? null : { 'matchValues': true }).pipe(
        map((result) => {
          // Simulate some asynchronous processing
          // You can replace the setTimeout with your actual asynchronous operation
          return result;
        })
      );
    };
  }
  get f() {
    return this.registerForm.controls;
  }
  showForm(){
  }
  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.registerForm.invalid) {
      this.error = 'Invalid data !';
      this.submitted= false;
      this.toastr.error(this.error, 'Error');
      return;
    } else {
      this.authService.signup(this.registerForm);
      this.toastr.success('Signup request sent succefully , waiting for admin confirmation!', 'Success');
    }
  }

  nationalities=["Tunisia", "French", "American","Dutch","Egyptian","Algerian","Moroccan",]
  
  genders=["Male","Female"]

  departement=["Administration","System","Networking","Development","Cyber Security"]

  fs=["Single","Maried","Divorced",]
    
}

