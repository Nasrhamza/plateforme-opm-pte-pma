import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { fromEvent } from 'rxjs';
import { User } from 'src/app/core/models/user';
import { VehicleEvent } from 'src/app/core/models/vehicleEvent';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';
import { EditEventComponent } from '../edit-event/edit-event.component';

@Component({
  selector: 'app-event-info-modal',
  templateUrl: './event-info-modal.component.html',
  styleUrls: ['./event-info-modal.component.scss'],
  providers:[ToastrService]

})
export class EventInfoModalComponent {
  @Input('payload') payload!:string
  currentUserId!:string
  event!:any
  constructor(
    public activeModal: NgbActiveModal,
    public eventService:VehicleServiceService,    
    private toastr: ToastrService,
    private modalService: NgbModal,

    ) {}
  ngOnInit(): void {
    this.currentUserId=localStorage.getItem('userId')!
    this.getEvent()
  }
  getEvent(){
   return this.eventService.getEventById(this.payload).subscribe(resultat => {
      this.event = resultat as VehicleEvent
  })
}
editEvent(id:string){
  const modalRef: NgbModalRef = this.modalService.open(EditEventComponent, {
    ariaLabelledBy: 'modal-basic-title',
    size: 'lg',
    keyboard: false ,
    backdropClass:'light-blue-backdrop'
  });
  modalRef.componentInstance.payload=id;
  modalRef.componentInstance.payloadd=this.event;
}
deleteEvent(id:string){
  this.eventService.deleteEvent(id).subscribe(res=>{
    if(res)
    this.toastr.success('Event deleted successfully' , "Success")
    this.activeModal.close("Deleted event");
  })
}

}
