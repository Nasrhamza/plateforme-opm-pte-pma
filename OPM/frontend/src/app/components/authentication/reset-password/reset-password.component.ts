import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private backendService: BackendService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Get token from URL
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Link',
        text: 'The reset password link is invalid or expired!',
        confirmButtonColor: '#d33'
      }).then(() => {
        this.router.navigate(['/auth/forgot-password']); // Redirect user
      });
    }
  }

  resetPassword() {
    if (this.form.invalid || this.form.value.password !== this.form.value.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Passwords do not match!',
        confirmButtonColor: '#d33'
      });
      return;
    }

    this.isSubmitting = true;
    const payload = {
      token: this.token,
      password: this.form.value.password
    };

    this.backendService.post(`${environment.apiUrl}/auth/resetPassword`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your password has been reset successfully.',
          confirmButtonColor: '#0056b3'
        }).then(() => {
          this.router.navigate(['/auth/signin']); // Redirect to login
        });
      },
      error: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to reset password. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
