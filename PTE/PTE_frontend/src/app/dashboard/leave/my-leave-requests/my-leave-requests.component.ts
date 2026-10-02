import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/service/auth.service';
import { LabServiceService } from 'src/app/core/service/lab-service.service';
import { LeaveServiceService } from 'src/app/core/service/leave-service.service';
import Swal from 'sweetalert2';
import { LeaveDocComponent } from '../leave-doc/leave-doc.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-my-leave-requests',
  templateUrl: './my-leave-requests.component.html',
  styleUrls: ['./my-leave-requests.component.scss'],
  providers: [ToastrService],

})
export class MyLeaveRequestsComponent {
  active: any;
  active2 = 'top';
  active3!: number;
  active4: any;
  disabled = true;
  user:any
  readonly leaveCertUrl = environment.LEAVE_CERT_URL;

  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
    }
  }

  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active3 = 1;
    }
  }

  allLeaves: any[] = [];
  teamLeaves: any[] = [];
  allWorkerLeaves: any[] = [];
  rowsToApprove: any[] = [];
  expanded: any = {};
  timeout: any;
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  temp: any[] = [];
  role:string=""
  leaveType:any[] = [];
  @ViewChild('table') table!: DatatableComponent;

  constructor(
    private leaveService: LeaveServiceService,
    private modalService: NgbModal,
    private authService : AuthService,
    private toastr: ToastrService,
    private router: Router) {
  }
  ngOnInit() {
    this.authService.getUser().subscribe(res=> {
      this.user=res
      //console.log(this.user)
    })
    this.role=localStorage.getItem('roles')!
    if(this.role=="ADMIN" || this.role=="ASSISTANT"){
    this.getAllLeave()
  }else{
    this.getUserLeave()
  }
  this.getTeamRequests()
}

  getTeamRequests(){
    this.leaveService.getWorkerRequests(localStorage.getItem("userId")!).subscribe(resultat => {
      this.teamLeaves = resultat;
      this.teamLeaves.reverse()

      // console.log(this.teamLeaves)
      setTimeout(() => {
            this.loadingIndicator = false;
          }, 500);
    })
  }
  getUserLeave(){
    this.leaveService.getUserLeave(localStorage.getItem("userId")!).subscribe(resultat => {
      this.allLeaves = resultat;
      this.allLeaves.reverse()
      setTimeout(() => {
            this.loadingIndicator = false;
          }, 500);
    })
  }
  getAllLeave(){
    this.leaveService.getAllLeaves().subscribe(resultat => {
      this.allLeaves = resultat;
      this.allLeaves.reverse()
      setTimeout(() => {
            this.loadingIndicator = false;
          }, 500);
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  onPage(event: any) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
    }, 100);
  }

  getRowHeight(row: any) {
    return row.height;
  }
  
  toggleExpandRow(row: any) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event: any) {
  }

  workerApproveRequest(reqID:string){
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
      confirmButtonText: 'Yes, Approve it!',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Confirmed!',
          'Leave request has been confirmed.',
          'success'
        )
        this.leaveService.workerAccept(reqID).subscribe(resultat => {
          this.teamLeaves = this.teamLeaves.filter(req => req._id !== reqID);
          this.getTeamRequests()
        })
      } 
    })
  }
  workerDeclineRequest(reqID:string){
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
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Declined!',
          'Leave request has been declined.',
          'success'
        )
        this.leaveService.workerDecline(reqID).subscribe(resultat => {
          this.teamLeaves = this.teamLeaves.filter(req => req._id !== reqID);
          this.getTeamRequests()
        })
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Leave request is safe :)',
          'error'
        )
      }
    })
  }

  managerApproveRequest(reqID:string){
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
      confirmButtonText: 'Yes, Approve it!',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Confirmed!',
          'Leave request has been confirmed.',
          'success'
        )
        this.leaveService.managerAccept(reqID).subscribe(resultat => {
          this.allWorkerLeaves = this.allWorkerLeaves.filter(req => req._id !== reqID);
          this.getAllLeave()
        })
      } 
    })
  }
  managerDeclineRequest(reqID:string){
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
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Declined!',
          'Leave request has been declined.',
          'success'
        )
        this.leaveService.managerDecline(reqID).subscribe(resultat => {
          this.allWorkerLeaves = this.allWorkerLeaves.filter(req => req._id !== reqID);
          this.getAllLeave()
        })
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Leave request is safe :)',
          'error'
        )
      }
    })
  }
  downloadDoc(row:any){
    const modalRef = this.modalService.open(LeaveDocComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false,
      backdropClass: 'light-blue-backdrop'
    });
    modalRef.componentInstance.payload =row
  }
  downloadCertif(row:any){
    window.open(this.leaveCertUrl+row.certif)
  }

  handleMyLeaveSearch(event : any){
    const search:string = event.target.value;
    if(search.length > 0){
      this.allLeaves = this.allLeaves.filter(leave => leave.fullName.toLowerCase().includes(search.toLowerCase()) || leave.code.toLowerCase().includes(search.toLowerCase()) || leave.type.toLowerCase().includes(search.toLowerCase()) )
    }else{
      if(this.role=="ADMIN" || this.role=="ASSISTANT"){
        this.getAllLeave()
      }else{
        this.getUserLeave()
      }
      this.getTeamRequests()
    }
  }
  handleTeamLeaveSearch(event : any){
    const search:string = event.target.value;
    if(search.length > 0){
      this.teamLeaves = this.teamLeaves.filter(leave => leave.fullName.toLowerCase().includes(search.toLowerCase()) || leave.code.toLowerCase().includes(search.toLowerCase()) || leave.type.toLowerCase().includes(search.toLowerCase()) )
    }else{
      if(this.role=="ADMIN" || this.role=="ASSISTANT"){
        this.getAllLeave()
      }else{
        this.getUserLeave()
      }
      this.getTeamRequests()
    }
  }
  handleAllLeaveSearch(event : any){
    const search:string = event.target.value;
    if(search.length > 0){
      this.allLeaves = this.allLeaves.filter(leave => leave.fullName.toLowerCase().includes(search.toLowerCase()) || leave.code.toLowerCase().includes(search.toLowerCase()) || leave.type.toLowerCase().includes(search.toLowerCase()) )
    }else{
      if(this.role=="ADMIN" || this.role=="ASSISTANT"){
        this.getAllLeave()
      }else{
        this.getUserLeave()
      }
      this.getTeamRequests()
    }
  }
}
