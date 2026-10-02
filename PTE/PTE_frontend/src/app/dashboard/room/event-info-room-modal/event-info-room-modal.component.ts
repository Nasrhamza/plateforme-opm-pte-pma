import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RoomEvent } from 'src/app/core/models/roomEvent';
import { RoomServiceService } from 'src/app/core/service/room-service.service';
import { EditRoomEventComponent } from '../edit-room-event/edit-room-event.component';
@Component({
  selector: 'app-event-info-room-modal',
  templateUrl: './event-info-room-modal.component.html',
  styleUrls: ['./event-info-room-modal.component.scss'],
  providers:[ToastrService]
})
export class EventInfoRoomModalComponent {
  @Input('payload') payload!:string
  event!:any
  currentUserId!:string

  constructor(
    public activeModal: NgbActiveModal,
    public roomEventService:RoomServiceService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    ) {}
  ngOnInit(): void {
    this.currentUserId=localStorage.getItem('userId')!
    this.getEvent()
  }
  getEvent(){
   return this.roomEventService.getEventById(this.payload).subscribe(resultat => {
      this.event = resultat as RoomEvent
      //console.log(this.event,this.payload)
  })
}
editEvent(id:string){
  const modalRef: NgbModalRef = this.modalService.open(EditRoomEventComponent, {
    ariaLabelledBy: 'modal-basic-title',
    size: 'lg',
    keyboard: false ,
    backdropClass:'light-blue-backdrop'
  });
  modalRef.componentInstance.payload=id;
  modalRef.componentInstance.payloadd=this.event; 
}
deleteEvent(id:string){
  this.roomEventService.deleteEvent(id).subscribe(res=>{
    if(res)
    this.toastr.success('Event deleted successfully' , "Success")
    this.activeModal.close("Deleted event");
  })
}
}
