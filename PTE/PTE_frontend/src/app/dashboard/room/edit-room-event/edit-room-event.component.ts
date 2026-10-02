import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { Room } from 'src/app/core/models/room';
import { RoomServiceService } from 'src/app/core/service/room-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
@Component({
  selector: 'app-edit-room-event',
  templateUrl: './edit-room-event.component.html',
  styleUrls: ['./edit-room-event.component.scss'],
  providers:[ToastrService]
})
export class EditRoomEventComponent {
  @Input("payload") payload!:any
  @Input("payloadd") payloadd!:any
  roomEventForm!: UntypedFormGroup;
  roomEventFailed!:boolean
  submitted = false;
  error = '';
  selectedDate!:any
  event!:any
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private roomService:RoomServiceService,
    private userService:UserServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.getEvent()
    this.roomEventForm = this.formBuilder.group({
     title :new FormControl(this.payloadd.title,[Validators.required]),
     start:new FormControl('',[Validators.required]),
     end:new FormControl('',[Validators.required]),
  });
  }
  getEvent(){
    return this.roomService.getEventById(this.payload).subscribe(resultat => {
       this.event = resultat 
   })
 }
  onSubmit(roomEventForm:FormGroup){
    this.submitted = true;
    this.error = '';
    if (roomEventForm.invalid) {
      this.error = 'Invalid data !';
      this.submitted= false;
      return;
    } else if(this.roomEventForm.value.start>this.roomEventForm.value.end){
          this.toastr.error('Invalid date rang', "Error")
        }else {
        const roomEvent = {
          title: this.roomEventForm.value.title,
          start: this.roomEventForm.value.start,
          end: this.roomEventForm.value.end,
        };
        this.roomService.updateEvent(this.event._id,roomEvent as any).subscribe(resultat=>{
        this.toastr.success('Event updated successfully', "Success")
        this.activeModal.close('Event updated successfully');
      })
    }
  }
}
