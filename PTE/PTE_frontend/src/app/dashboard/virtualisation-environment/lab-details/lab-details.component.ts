import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LabServiceService } from 'src/app/core/service/lab-service.service';
import Swal from 'sweetalert2';
import { RequestApprovalModalComponent } from '../request-approval-modal/request-approval-modal.component';

@Component({
  selector: 'app-lab-details',
  templateUrl: './lab-details.component.html',
  styleUrls: ['./lab-details.component.scss'],
  providers: [ToastrService]
})
export class LabDetailsComponent {
  @Input('payload_lab') payload_lab: any
  userRole!: string
  userId!: string

  constructor(
    private toastr: ToastrService,
    private labService: LabServiceService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,

  ) { }
  ngOnInit(): void {
    this.userId = localStorage.getItem('userId')!
    this.userRole = localStorage.getItem('roles')!
  }

  acceptLab(labId: string, lab: any) {
    if (this.userRole === 'LAB-MANAGER') {
      const modalRef: NgbModalRef = this.modalService.open(RequestApprovalModalComponent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        keyboard: false,
        backdropClass: 'light-blue-backdrop'
      });
      modalRef.componentInstance.payload_id = labId
      modalRef.componentInstance.payload_lab = lab
      this.activeModal.close('Close click');
      modalRef.result.then((res) => {
      })
    } else {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })

      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Yes, approve it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({ title: 'Approved!', text: 'Lab has been approved.', icon: 'success', confirmButtonColor: '#47A992', });
          this.labService.approveLab(labId).subscribe(res => {
            this.toastr.success(res.message, 'Success');
            this.activeModal.close('Close click');

          })
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire({
            title: 'Cancelled',
            text: 'Lab is safe :)',
            icon: 'warning',
            confirmButtonColor: '#47A992',
          }
          )
        }
      })
    }
  }
  declineLab(labId: string) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, decline it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Declined!', text: 'Lab has been declined.', icon: 'success', confirmButtonColor: '#47A992', });
        this.labService.declineLab(labId).subscribe(res => {
          this.toastr.success(res.message, 'Success');
          this.activeModal.close('Close click');
        })
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire({
          title: 'Cancelled',
          text: 'Lab is safe :)',
          icon: 'warning',
          confirmButtonColor: '#47A992',
        }
        )
      }
    })
  }
}
