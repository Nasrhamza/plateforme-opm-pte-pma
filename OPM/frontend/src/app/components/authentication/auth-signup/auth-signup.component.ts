import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent {
  isSigningUp: boolean = false;
  technicianForm: FormGroup;
  selectedFile: File | null = null;  // For profile picture
  selectedSignature: File | null = null;  // For signature
  fileError: boolean = false;
  isPassportChecked: boolean = false;

  constructor(private fb: FormBuilder, private apiService: AuthService, private router: Router) {
    this.technicianForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      permisConduire: [false],
      passeport: [false],        
      expiredAt: [''], 
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = false;
    }
  }
  

  onSignatureChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedSignature = file;
    }
  }

  onPassportChange(event: any) {
    this.isPassportChecked = event.target.checked;
    if (!this.isPassportChecked) {
      this.technicianForm.get('expiredAt').disable();
    } else {
      this.technicianForm.get('expiredAt').enable();
    }
  }

  signUp(): void {
    if (this.isSigningUp) return;

    if (this.technicianForm.valid && this.selectedFile && this.selectedSignature) {
      if (this.technicianForm.value.password !== this.technicianForm.value.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Passwords do not match',
          text: 'Please make sure both passwords match.',
        });
        return;
      }

      const formData = new FormData();
      formData.append('firstName', this.technicianForm.value.firstName);
      formData.append('lastName', this.technicianForm.value.lastName);
      formData.append('phoneNumber', this.technicianForm.value.phoneNumber);
      formData.append('email', this.technicianForm.value.email);
      formData.append('secondEmail', this.technicianForm.value.secondEmail);
      formData.append('password', this.technicianForm.value.password);
      formData.append('permisConduire', this.technicianForm.value.permisConduire.toString());
      formData.append('passeport', this.technicianForm.value.passeport.toString());
      formData.append('authority', 'technician');
      formData.append('profilePicture', this.selectedFile);  // Profile Picture
      formData.append('signature', this.selectedSignature);  // Signature Image
      formData.append('expiredAt', this.technicianForm.value.expiredAt);

      this.isSigningUp = true;

      this.apiService.signup(formData).subscribe(
        response => {
          this.isSigningUp = false;
          Swal.fire({
            icon: 'success',
            title: 'Account Created',
            text: 'Technician account created successfully.',
          }).then(() => {
            this.router.navigate(['/auth/signin']);
          });
        },
        error => {
          this.isSigningUp = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error.message || 'An error occurred while creating the account.',
          });
        }
      );
    } else {
      this.technicianForm.markAllAsTouched();
      this.fileError = !this.selectedFile || !this.selectedSignature;
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields, including the profile picture and signature.',
      });
    }
  }
}

