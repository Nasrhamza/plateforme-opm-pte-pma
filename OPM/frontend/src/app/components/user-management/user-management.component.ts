import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AddUserComponent } from './add-user/add-user.component';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  fileurl: string = environment.fileUrl
  usersList: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  userCount: number = 0;
  selectedUser: any;
  techCount

  constructor(
    private backendService: BackendService,
    public sharedService: SharedService,
    private modalService: NgbModal,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getListEmployee();
  }

  onSearchChange() {
    this.page = 1;  // Reset to page 1 on search
    this.cdr.detectChanges(); // Trigger change detection in case pagination needs to update immediately
  }

  // If you're using ngModel for searchTerm in your template, use this to capture search term changes
  set search(value: string) {
    this.searchTerm = value;
    this.onSearchChange(); // Reset page to 1 whenever search term changes
  }

  get search(): string {
    return this.searchTerm;
  }

  getListEmployee() {
    this.backendService.get(`${environment.apiUrl}/tech/getAllEmployees`).subscribe(
      (response: any) => {
        this.usersList = response.rows.map(e => ({ ...e, fullName: `${e.firstName} ${e.lastName}` }));;
        this.userCount = this.usersList.length;
      });
  }
  openAddUser() {
    const modalRef = this.modalService.open(AddUserComponent);
    modalRef.componentInstance.title = 'Add New User';
    modalRef.componentInstance.add = true;
  }

  toggleStatus(technician: any) {
    const newStatus = !technician.valid;  // Determine the new status but do not change it yet

    Swal.fire({
      title: 'Are you sure?',
      text: newStatus ? 'Do you want to activate this account?' : 'Do you want to deactivate this account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, confirm!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.changeStatCompte(technician._id, newStatus).then(success => {
          if (success) {
            technician.valid = newStatus;  // Update the UI only after successful confirmation
          }
        });
      }
    });
  }
  openDetails(user: any, content: TemplateRef<any>) {
    this.selectedUser = user;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });
  }

  changeStatCompte(id: string, etat: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      const payload = { _id: id, valid: etat };
      this.backendService.put(`${environment.apiUrl}/tech/updateStatTech`, payload).subscribe(
        () => {
          Swal.fire({
            title: 'Success!',
            text: `The account has been ${etat ? 'activated' : 'deactivated'}.`,
            icon: 'success',
          });
          resolve(true);
        },
        () => {
          Swal.fire({
            title: 'Error!',
            text: 'Something went wrong. Please try again later.',
            icon: 'error',
          });
          resolve(false);
        }
      );
    });
  }

}
