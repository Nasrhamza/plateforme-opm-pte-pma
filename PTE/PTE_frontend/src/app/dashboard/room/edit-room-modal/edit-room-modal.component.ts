import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Room } from 'src/app/core/models/room';
import { RoomServiceService } from 'src/app/core/service/room-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-edit-room-modal',
  templateUrl: './edit-room-modal.component.html',
  styleUrls: ['./edit-room-modal.component.scss'],
  providers: [ToastrService],

})
export class EditRoomModalComponent {
  @Input('payload') payload!:Room
  roomEdittForm!: FormGroup
  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private vehicleService:RoomServiceService,
    private userService:UserServiceService,
    private toastr: ToastrService) {}
  
    ngOnInit(){
      this.roomEdittForm = new FormGroup({
        label:new FormControl(this.payload.label,[Validators.required]),
        location:new FormControl(this.payload.location,[Validators.required]),
        capacity:new FormControl(this.payload.capacity,[Validators.required]),
    });
    }
  
    onSubmit(){
      return this.vehicleService.editRoom(this.payload._id,this.roomEdittForm.value).subscribe(resultat=>{
        if(!resultat){
          this.toastr.error('oops! something went wrong', 'Error');
          this.activeModal.close('Close click');
        }else {
          this.toastr.success('Vehicle updated successfuly!', 'Success');
          this.activeModal.close('Close click');
        }
      })
    }
}
