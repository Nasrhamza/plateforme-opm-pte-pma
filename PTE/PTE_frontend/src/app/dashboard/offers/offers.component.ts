import { Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { InternsService } from 'src/app/core/service/interns.service';
import { CreateOfferComponent } from './create-offer/create-offer.component';
import { InternshipOffer } from 'src/app/core/models/InternshipOffer';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { EditOfferComponent } from './edit-offer/edit-offer.component';
import { AssignQuizToOfferComponent } from './assign-quiz-to-offer/assign-quiz-to-offer.component';
import { FillQuizComponent } from './fill-quiz/fill-quiz.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  providers: [ToastrService],
})
export class OffersComponent {
  offers! : any[]
  userId!: string
  userRole!: string
  temp: any[] = [];
  constructor(
    private offerService : InternsService,
    private modalService:NgbModal,
    private toastr: ToastrService,
    private router:Router) { }
  ngOnInit():void {
    this.userRole = localStorage.getItem('roles')!
    this.userId = localStorage.getItem('userId')!
    this.getAllOffers()
  }

  getAllOffers(){
    this.offerService.getOffers().subscribe(res=>{
      this.offers = res.data
      this.offers.reverse()
      this.temp = res.data
    })
  }
redirectDetails(offerId:string){
  this.router.navigate(['/dashboard/offerDetails/'+offerId])
}
  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d: any) {
      return d.departement.toLowerCase().indexOf(val) !== -1 || 
             d.title.toLowerCase().indexOf(val) !== -1 || 
             d.technologies.toLowerCase().indexOf(val) !== -1 ||  
             !val;
    });

    // update the rows
    this.offers = temp;
  }

  createOffer(){
    const modalRef: NgbModalRef = this.modalService.open(CreateOfferComponent, {
      keyboard: false ,
      backdropClass:'light-blue-backdrop',
      size: 'lg'
    });
    modalRef.result.then((res)=>{
      this.getAllOffers()
    })   
  }
  deleteOffer(id:string){
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
        Swal.fire({title:'Deleted!',text: 'Offer has been deleted.',icon:'success',confirmButtonColor: '#47A992',});
        this.offerService.deleteOffer(id).subscribe(res=>{
        this.offers = this.offers.filter(r => r._id !== id);
        this.toastr.success(res.message, 'Success');
      })
  }else if (
    /* Read more about handling dismissals below */
    result.dismiss === Swal.DismissReason.cancel
  ) {
    Swal.fire({
      title:'Cancelled',
      text:'Offer is safe :)',
      icon:'warning',
      confirmButtonColor: '#47A992',
    }
    )
  }
})
  }

  editOfferModal(offer:InternshipOffer){
    const modalRef: NgbModalRef = this.modalService.open(EditOfferComponent, {
      ariaLabelledBy:'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=offer
    modalRef.result.then((res)=>{
      this.getAllOffers()
    })
  }
 
  openOfferDetails(offer:InternshipOffer){
    this.router.navigate(['/dashboard/offerDetails/'+offer._id])
    // const modalRef: NgbModalRef = this.modalService.open(OfferDetailsComponent, {
    //   keyboard: false ,
    //   backdropClass:'light-blue-backdrop',
    //   size: 'lg'
    // });
    // modalRef.componentInstance.data = offer
    // modalRef.result.then((res)=>{
    //   this.getAllOffers()
    // })   
  }
  FillQuizModal(id:string){
    const modalRef: NgbModalRef = this.modalService.open(FillQuizComponent, {
      keyboard: false ,
      backdropClass:'light-blue-backdrop',
      size: 'lg'
    });
    modalRef.componentInstance.data = id
    modalRef.result.then((res)=>{
      this.getAllOffers()
    })   
  }
}
