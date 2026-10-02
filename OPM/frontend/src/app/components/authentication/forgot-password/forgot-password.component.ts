import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { BackendService } from 'src/app/services/backend.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,

  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async sendResetLink() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const emailData = { email: this.form.value.email };

    this.backendService.post(`${environment.apiUrl}/auth/requestPasswordReset`, emailData).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'A password reset link has been sent to your email!',
          confirmButtonColor: '#0056b3'
        });
      },
      error: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to send reset link. Please check your email and try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

}
