import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public isCompleteStatus = false;
  public isAssignUsers = false;
  public isRevision = false;

  user: any = {};
  commercial: any = {};
  pmo: any = {};
  admin: any = {};
  assistant: any = {};
  technician: any = {};
  client: any = {};
  helpdeskUser: any = {};
  role: string;
  selectedImage: string | ArrayBuffer | null = null;
  imageFile: File | null = null;

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user;
    this.role = this.user.authority;
    this.loadUserData();
  }

  private loadUserData(): void {
    switch (this.role) {
      case 'admin':
        this.getAdmin(this.user._id);
        break;
      case 'technician':
        this.getTechnician(this.user._id);
        break;
      case 'client':
        this.getClient(this.user._id);
        break;
      case 'commercial':
        this.getCommercial(this.user._id);
        break;
      case 'pmo':
        this.getPmo(this.user._id);
        break;
      case 'assistant':
        this.getAssistant(this.user._id);
        break;
    }
  }

  getImagePath(imagePath: string): string {
    return `${environment.apiUrl}/uploads/${imagePath}`;
  }

  onProfileUpdate(form: NgForm): void {
    if (form.invalid) {
      this.showAlert('error', 'Invalid form', 'Please fill out all required fields correctly.');
      return;
    }

    const payload = this.createProfileUpdatePayload(form);

    this.backendService.put(this.getProfileUpdateUrl(), payload).subscribe((res: any) => {
      this.updateLocalUserData(res.data);
      this.showAlert('success', 'Profile updated', 'Your profile has been successfully updated.');
    });
  }

  private createProfileUpdatePayload(form: NgForm): FormData {
    const payload = new FormData();
    Object.keys(form.value).forEach(key => payload.append(key, form.value[key]));
    if (this.imageFile) payload.append('image', this.imageFile);
    return payload;
  }

  private getProfileUpdateUrl(): string {
    const apiUrl = environment.apiUrl;
    const userId = this.user._id;

    switch (this.role) {
      case 'admin':
        return `${apiUrl}/admin/updateAdmin/${userId}`;
      case 'technician':
        return `${apiUrl}/tech/updateTechnician/${userId}`;
      case 'client':
        return `${apiUrl}/client/updateClient/${userId}`;
      default:
        // For 'pmo', 'assistant', and any other roles
        return `${apiUrl}/user/updateUser/${userId}`;
    }

  }


  private updateLocalUserData(data: any): void {
    const updatedUser = this.authService.getAuthUser();
    updatedUser.user.firstName = data.firstName;
    updatedUser.user.lastName = data.lastName;
    updatedUser.user.image = data.image;
    this.authService.saveAuthToLS(updatedUser);
    this.authService.authenticatedUser.next(updatedUser);
  }

  onSubmitPassword(form: NgForm): void {
    if (form.invalid || this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showAlert('error', 'Invalid form', 'Please ensure all fields are filled out correctly.');
      return;
    }
    let rolepassword
    if (this.role == 'admin') { rolepassword = 'admin' } else rolepassword = 'user'

    const apiUrl = `${environment.apiUrl}/user/changePassword/${this.user._id}`;
    const payload = { currentPassword: this.passwordForm.currentPassword, newPassword: this.passwordForm.newPassword, rolepassword };

    this.backendService.post(apiUrl, payload).subscribe(() => {
      this.showAlert('success', 'Password changed', 'Your password has been successfully changed.');
      this.clearPasswordForm();
    });
  }

  private clearPasswordForm(): void {
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  private showAlert(icon: 'success' | 'error', title: string, text: string): void {
    Swal.fire({ icon, title, text });
  }

  getAdmin(id: string): void {
    this.fetchUserData(`${environment.apiUrl}/admin/getAdminById/${id}`, (data) => this.admin = data);
  }

  getUser(id: string): void {
    this.fetchUserData(`${environment.apiUrl}/user/getUserById/${id}`, (data) => this.user = data);
  }
  getCommercial(id: string): void {
    this.fetchUserData(`${environment.apiUrl}/user/getUserById/${id}`, (data) => this.commercial = data);
  }
  getPmo(id: string): void {
    this.fetchUserData(`${environment.apiUrl}/user/getUserById/${id}`, (data) => this.pmo = data);
  }

  getAssistant(id: string): void {
    this.fetchUserData(`${environment.apiUrl}/user/getUserById/${id}`, (data) => this.assistant = data);
  }

  getTechnician(id: string): void {
    this.fetchUserData(`${environment.apiUrl}/tech/getTechnicianById/${id}`, (data) => this.technician = data);
  }

  getClient(id: string): void {
    this.fetchUserData(`${environment.apiUrl}/client/getClientById/${id}`, (data) => this.client = data);
  }


  private fetchUserData(url: string, successCallback: (data: any) => void): void {
    this.backendService.get(url).subscribe(successCallback, (error) => {
      console.error('Error fetching user details:', error);
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      Swal.fire({
        title: 'No File Selected!',
        text: 'Please select an image file.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // if (file.size > 500000) {
    //   Swal.fire({
    //     title: 'File Too Large!',
    //     text: 'The selected file exceeds the size limit of 5 Mo.',
    //     icon: 'error',
    //     confirmButtonText: 'OK',
    //   });
    //   return;
    // }
    const allowedFormats = ['image/png', 'image/jpeg'];
    if (!allowedFormats.includes(file.type)) {
      Swal.fire({
        title: 'Invalid File Format!',
        text: 'Only PNG and JPEG images are allowed.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => this.selectedImage = e.target.result;
    reader.readAsDataURL(file);
  }


}
