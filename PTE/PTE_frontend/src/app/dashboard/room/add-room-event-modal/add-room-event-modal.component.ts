import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { Room } from 'src/app/core/models/room';
import { RoomServiceService } from 'src/app/core/service/room-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-add-room-event-modal',
  templateUrl: './add-room-event-modal.component.html',
  styleUrls: ['./add-room-event-modal.component.scss'],
  providers:[ToastrService]

})
export class AddRoomEventModalComponent {
  @Input("data") data!:any
  @Input("room") room!:Room
  EventForm!: FormGroup;
  roomEventFailed!:boolean
  submitted = false;
  error = '';
  selectedDate!:any

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private roomService:RoomServiceService,
    private userService:UserServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.selectedDate=format(new Date(this.data),"MM/dd/yyy HH:mm")
    
    
    this.EventForm = new FormGroup({
     title :new FormControl('',[Validators.required]),
     start:new FormControl(this.selectedDate,[Validators.required]),
     end:new FormControl('',[Validators.required]),
     //room:new FormControl('',[Validators.required]),
     //room:new FormControl('',[Validators.required]),
     //applicant:new FormControl('',[Validators.required]),
  });
  }
 
  injectValues(){
    this.EventForm.get('room')?.setValue([this.room.label, "||", this.room.location])
  }
 
 
  

  onSubmit(roomEventForm:FormGroup){
    this.submitted = true;
    this.error = '';
    if (roomEventForm.invalid) {
      this.error = 'Invalid data !';
      this.submitted= false;
      return;
    } else if(this.EventForm.value.start>this.EventForm.value.end){
          this.toastr.error('Invalid date rang', "Error")
        }else {
     
        const roomEvent = {
          title: this.EventForm.value.title,
          start: this.EventForm.value.start,
          end: this.EventForm.value.end,
          room: this.room._id,
          applicant: localStorage.getItem("userId"),
          //isAccepted:true
        };
        
      this.roomService.addEvent(roomEvent).subscribe(resultat=>{
        this.toastr.success('Event added successfully', "Success")
        this.activeModal.close('Event added successfully');
      })
      //console.log(roomEventForm.value)
    }
  }
}
