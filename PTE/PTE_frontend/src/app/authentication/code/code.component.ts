import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent {

  codeSendForm!: FormGroup;
  submitted = false;
  error = '';


  constructor(  private formBuilder: FormBuilder , 
    private authService : AuthService,
    private router :Router) {}

    ngOnInit(): void {
      this.codeSendForm = this.formBuilder.group({
       code: ['',Validators.required],
      })
    }  

    get f() {
      return this.codeSendForm.controls;
    }
  
    onSubmit(){
      this.submitted = true;
      this.error = '';
      
      let code = this.f['code'].value
      if (this.codeSendForm.invalid) {
        this.error = 'Invalid email !';
        this.submitted= false;
        return;
      } else {
       this.authService.validateCode(code);
      }
    }

}
