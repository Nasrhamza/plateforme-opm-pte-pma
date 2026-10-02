import { Component, OnInit, TemplateRef } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import Observer from 'src/app/services/observer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssignEquipmentComponent } from '../help-desk/list-users-helpdesk/list-users/assign-equipment/assign-equipment.component';
import Swal from 'sweetalert2';
import { AddEquipmentComponent } from '../help-desk/list-users-helpdesk/add-equipment/add-equipment/add-equipment.component';


@Component({
  selector: 'app-list-client',
  templateUrl: './list-client.component.html',
  styleUrls: ['./list-client.component.scss']
})
export class ListClientComponent implements OnInit {
  fileurl: string = environment.fileUrl
  usersList: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  techCount: number = 0;
  selectedUser: any;

  constructor(
    private backendService: BackendService,
    public sharedService: SharedService,
    private router: Router,
    private modalService: NgbModal,

  ) { }

  async ngOnInit() {
    this.getListTech()

  }

  getListTech() {
    this.backendService.get(`${environment.apiUrl}/tech/getListTechnician`).subscribe(
      (response: any) => {
        this.usersList = response.rows.map(e => ({ ...e, fullName: `${e.firstName} ${e.lastName}` }));;
        this.techCount = this.usersList.length;
      });
  }
  getProfileImage(imagePath: any): string {
    return `${environment.apiUrl}/uploads/${imagePath}`;
  }

openDetails(user: any, content: TemplateRef<any>) {
    this.selectedUser = user;
    // this.getListEquipmentUser(user._id)
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl' // Use 'lg' for a large modal or 'xl' for extra large
    });
  }

  updateEquipment(item) {
    const modalRef = this.modalService.open(AddEquipmentComponent);
    modalRef.componentInstance.title = 'Update Equipment ';
    modalRef.componentInstance.equipement = item;
    modalRef.componentInstance.add = false;
  }
  deleteEquipment(id) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Equipment ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const apiUrl = environment.apiUrl + '/equipmentHelpdesk/deleteEquipmentUser';
        const requestBody = {
          equipmentId: id,
          userId: this.selectedUser._id,
          role:'tech',
        };
        this.backendService.post(apiUrl, requestBody).subscribe(
          (res: any) => {
            this.selectedUser.listEquipment = this.selectedUser.listEquipment.filter(x => x._id != res.rows._id)
            Swal.fire({
              title: 'Deleted!',
              text: 'The Helpdesk Equipment has been successfully deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },
        );
      }
    });
  }

  toggleStatus(technician: any) {
    const newStatus = !technician.valid;  // Toggle the current status
    this.changeStatCompte(technician._id, newStatus);  // Update the backend
    technician.valid = newStatus;  // Update the status in the UI
  }

  assignEquipments(item) {
    const modalRef = this.modalService.open(AssignEquipmentComponent);
    modalRef.componentInstance.userId = item._id;
    modalRef.componentInstance.role = 'tech';
    modalRef.result.then(res => {
      if (res !== 'Close click') {
        this.selectedUser.listEquipment = [... this.selectedUser.listEquipment, res];
      }
    })
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
        this.backendService.put(`${environment.apiUrl}/tech/updateStatTech`, payload).subscribe(
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

}
