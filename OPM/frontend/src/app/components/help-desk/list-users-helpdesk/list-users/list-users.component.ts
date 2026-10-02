import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Observer from 'src/app/services/observer';
import { AddUserComponent } from './add-user-helpdesk/add-user/add-user.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit {
  fileurl: string = environment.fileUrl
  usersList
  userCount
  pageSize = 6;
  pageSizes = [5, 10, 15];
  term: any;
  searchTerm: string = '';
  page: number = 1;
  selectedUser: any;
  listEquipments: any;
  equipmentCount: number = 0;
  constructor(
    private backendService: BackendService,
    public sharedService: SharedService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getListUser();
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
  getListUser() {
    this.backendService.get(`${environment.apiUrl}/helpdesk/getListHelpdeskUser`).subscribe(
      (response: any) => {
        this.usersList = response.rows.map(e => ({ ...e, fullName: `${e.firstName} ${e.lastName}` }));
        this.userCount = this.usersList.length;
        console.log(this.usersList)
      });
  }

  toggleStatus(user: any) {
    const newStatus = !user.valid;  // Toggle the current status
    this.changeStatCompte(user._id, newStatus);  // Update the backend
    user.valid = newStatus;  // Update the status in the UI
  }

  changeStatCompte(id: string, etat: boolean) {
    const payload = { _id: id, valid: etat };
    Swal.fire({
      title: 'Are you sure?',
      text: etat ? 'Do you want to activate this account?' : 'Do you want to deactivate this account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, confirm!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform the API call
        this.backendService.put(`${environment.apiUrl}/user/updateStatUser`, payload).subscribe(
          () => {
            // Success alert
            Swal.fire({
              title: 'Success!',
              text: `The account has been ${etat ? 'activated' : 'deactivated'}.`,
              icon: 'success',
            });
          },
          (error) => {
            // Failure alert
            Swal.fire({
              title: 'Error!',
              text: 'Something went wrong. Please try again later.',
              icon: 'error',
            });
          }
        );
      }
    });
  }

  openAddUser() {
    const modalRef = this.modalService.open(AddUserComponent);
    modalRef.componentInstance.title = 'Add New User';
    modalRef.componentInstance.add = true;
  }
  openUpdateUser(item) {
    this.modalService.dismissAll();
    const modalRef = this.modalService.open(AddUserComponent);
    modalRef.componentInstance.title = 'Update User';
    modalRef.componentInstance.objectReceved = item;
    modalRef.componentInstance.add = false;
  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value;
    this.page = 1;
  }
  openDetails(user: any, content: TemplateRef<any>) {
    this.selectedUser = user;
    // this.getListEquipmentUser(user._id)
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,

    });
  }
}
