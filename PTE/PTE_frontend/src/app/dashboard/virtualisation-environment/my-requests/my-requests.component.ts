import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { LabServiceService } from 'src/app/core/service/lab-service.service';
import Swal from 'sweetalert2';
import { RequestApprovalModalComponent } from '../request-approval-modal/request-approval-modal.component';
import { LabDetailsComponent } from '../lab-details/lab-details.component';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-requests',
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss'],
  providers: [ToastrService],

})
export class MyRequestsComponent {
  activee!: number;
  rows: any[] = [];
  expanded: any = {};
  timeout: any;
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  temp: any[] = [];
  role:string=""
  @ViewChild('table') table!: DatatableComponent;
  intern_labs: any[] = [];
  offer_labs: any[] = [];
  mentorOffers: any[] = [];
  AllMentorOffers: any[] = [];
  offerSelected:boolean=false;
  offerEmpty:boolean=false;
  readonly picsUrl = environment.INTERN_IMAGE_URL;

  constructor(
    private userService: UserServiceService,
    private labService: LabServiceService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private router: Router) {
    // this.fetch((data: any) => {
    //   this.rows = data;
    //   setTimeout(() => {
    //     this.loadingIndicator = false;
    //   }, 500);
    // });
  }
  ngOnInit() {
    this.role=localStorage.getItem('roles')!.toString()
    if (this.role !== "LAB-MANAGER"){
      this.getUserLabRequest()
      this.getMentorOffers()
  }else{
    this.getAllLabRequest()
    this.getAllMentorOffers()
    this.getMentorOffers()
  }
    
  }
  selectOffer(offer:any){
    this.offerSelected=true
    this.labService.getLabsByOffer(offer._id).subscribe(res=>{
      this.offer_labs = res.data;
      if(this.offer_labs.length===0){
        this.offerEmpty=true
      }else{
        this.offerEmpty=false
      }
    })
  }
  selectRequest(req:any){
    const modalRef: NgbModalRef = this.modalService.open(LabDetailsComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload_lab=req
    modalRef.result.then((res)=>{
      this.labService.getLabsByOffer(req.offer._id).subscribe(res=>{
        this.offer_labs = res.data;
    })
    })
  }


  getInternLabs(){
    this.labService.getInternsLabsRequests(localStorage.getItem('userId')!).subscribe(resultat => {
      this.intern_labs = resultat.data;
    })
  }
  getMentorOffers(){
    this.labService.getMentorOffers(localStorage.getItem('userId')!).subscribe(resultat => {
      this.mentorOffers = resultat.data;
      this.mentorOffers.forEach((offer) => {
        this.labService.getLabsByOffer(offer._id).subscribe((res: any) => {
            // Store the lab count in the offer object
            offer.labCount = res.data.length;
        });
    });
    })
  }
  getAllMentorOffers(){
    this.labService.getAllMentorOffers().subscribe(resultat => {
      this.AllMentorOffers = resultat.data;
      this.AllMentorOffers.forEach((offer) => {
        this.labService.getLabsByOffer(offer._id).subscribe((res: any) => {
            // Store the lab count in the offer object
            offer.labCount = res.data.length;
        });
    });
    })
  }

 getUserLabRequest(){
  this.labService.userLabRequests(localStorage.getItem('userId')!).subscribe(resultat => {
    this.rows = resultat;
    this.rows.reverse()
    setTimeout(() => {
          this.loadingIndicator = false;
        }, 500);
  })
 }
 getAllLabRequest(){
  this.labService.getAllLabsRequests().subscribe(resultat => {
    this.rows = resultat;
    this.rows.reverse()
    setTimeout(() => {
          this.loadingIndicator = false;
        }, 500);
  })
 }

 approveRequestModal(id:any,lab:any){
  const modalRef: NgbModalRef = this.modalService.open(RequestApprovalModalComponent, {
    ariaLabelledBy: 'modal-basic-title',
    size: 'lg',
    keyboard: false ,
    backdropClass:'light-blue-backdrop'
  });
  modalRef.componentInstance.payload_id=id
  modalRef.componentInstance.payload_lab=lab
  modalRef.result.then((res)=>{
    this.getAllLabRequest()
  })
 }


  // approveRequest(id: string) {
  //   const swalWithBootstrapButtons = Swal.mixin({
  //     customClass: {
  //       confirmButton: 'btn btn-success',
  //       cancelButton: 'btn btn-danger'
  //     },
  //     buttonsStyling: false
  //   })

  //   swalWithBootstrapButtons.fire({
  //     title: 'Are you sure?',
  //     text: "You won't be able to revert this!",
  //     icon: 'warning',
  //     showCancelButton: false,
  //     confirmButtonText: 'Yes, Approve it!',
  //     reverseButtons: false
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       swalWithBootstrapButtons.fire(
  //         'Confirmed!',
  //         'Lab environment request has been confirmed.',
  //         'success'
  //       )
  //       this.labService.acceptLabRequest(id).subscribe(resultat => {
  //         this.getAllLabRequest()
  //       })
       
  //     }
  //   })
  // }
  declineRequest(id: string) {
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
          'Deleted!',
          'Lab environment request has been deleted.',
          'success'
        )
        this.labService.declineLabRequest(id).subscribe(resultat => {
          this.getAllLabRequest()
        })      
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Lab environment request is safe :)',
          'error'
        )
      }
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
  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d: any) {
      return d.firstName.toLowerCase().indexOf(val) !== -1 ||
            d.lastName.toLowerCase().indexOf(val) !== -1 ||
            d.email.toLowerCase().indexOf(val) !== -1 ||
            //d.code.toLowerCase().indexOf(val) !== -1 ||
            d.departement.toLowerCase().indexOf(val) !== -1 ||
            d.isAccepted.toLowerCase() === val ||
            !val;
    });
  }
  
  handleLabSearch(event : any){
    const search:string = event.target.value;
    if(search.length > 0){
      this.rows = this.rows.filter(lab => lab.firstName.toLowerCase().includes(search.toLowerCase()) || lab.lastName.toLowerCase().includes(search.toLowerCase()) || lab.code.toLowerCase().includes(search.toLowerCase()) || lab.status.toLowerCase().includes(search.toLowerCase()) )
    }else{
      if (this.role !== "LAB-MANAGER"){
        this.getUserLabRequest()
    }else{
      this.getAllLabRequest()
    }
    }
  }
  
  toggleExpandRow(row: any) {
    //console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event: any) {
    //console.log('Detail Toggled', event);
  }
}
