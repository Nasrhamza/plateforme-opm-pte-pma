import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TechEvent } from 'src/app/core/models/techEvent';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { EditTechEventComponent } from '../edit-tech-event/edit-tech-event.component';
import Swal from 'sweetalert2';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';
@Component({
  selector: 'app-event-info-tech-modal',
  templateUrl: './event-info-tech-modal.component.html',
  styleUrls: ['./event-info-tech-modal.component.scss'],
  providers:[ToastrService]
})
export class EventInfoTechModalComponent {
  @Input('payload') payload!:string
  event!:any
  vehicleEvent!:any
  caseNumberRes!:any
  currentUserId!:string
  constructor(
    public activeModal: NgbActiveModal,
    public techService:UserServiceService,
    public vehicleService:VehicleServiceService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    ) {}
  ngOnInit(): void {
    this.currentUserId=localStorage.getItem('userId')!
    this.getEvent()
  }
  getEvent(){
   return this.techService.getEventById(this.payload).subscribe(resultat => {
      this.event = resultat as any
      if(!this.event.vehicleEvent){
        return this.vehicleService.getEventById(this.event._id).subscribe(resultat => {
          this.vehicleEvent = resultat
        }) 
      }else{
        return this.vehicleService.getEventById(this.event.vehicleEvent).subscribe(resultat => {
          this.vehicleEvent = resultat
          this.vehicleService.checkProjectsRelatedToCurrentUser(this.vehicleEvent.applicant.email,this.vehicleEvent.caseNumber).subscribe(res=>{
            this.caseNumberRes = res
          })
          this.vehicleService.checkCaseNumberRelatedToCurrentUser(this.vehicleEvent.applicant.email, this.vehicleEvent.caseNumber).subscribe((res: any) => {
            this.caseNumberRes = res
          })
        }) 
      }
      
    })

}

 editEvent(id:string){
   //this.activeModal.close("go to edit event");
   const modalRef: NgbModalRef = this.modalService.open(EditTechEventComponent, {
     ariaLabelledBy: 'modal-basic-title',
     size: 'lg',
     keyboard: false ,
     backdropClass:'light-blue-backdrop'
   });
   modalRef.componentInstance.payload=id;
   modalRef.componentInstance.payloadd=this.event; 
 }
 deleteEvent(id:string){
  


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
            Swal.fire({title:'Deleted!',text: 'Event has been deleted.',icon:'success',confirmButtonColor: '#47A992',});
            this.techService.deleteEvent(id).subscribe(res=>{
              if(res)
              this.toastr.success('Event deleted successfully' , "Success")
              this.activeModal.close("Deleted event");
            })
            this.vehicleService.deleteEvent(id).subscribe(res=>{
              if(res)
              this.toastr.success('Event deleted successfully' , "Success")
              this.activeModal.close("Deleted event");
            })
      }else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire({
          title:'Cancelled',
          text:'Event is safe :)',
          icon:'warning',
          confirmButtonColor: '#47A992',
        }
        )
      }
    })
 }

}
