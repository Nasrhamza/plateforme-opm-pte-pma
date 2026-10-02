import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-edit-tech-event',
  templateUrl: './edit-tech-event.component.html',
  styleUrls: ['./edit-tech-event.component.scss'],
  providers:[ToastrService]

})
export class EditTechEventComponent {
  @Input('payload') payload!:any
  @Input('payloadd') payloadd!:any

  EventForm!: FormGroup;
  techEventFailed!:boolean
  submitted = false;
  error = '';
  selectedDate!:any
  event!:any
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private techService:UserServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){   
    this.EventForm = new FormGroup({
      title :new FormControl(this.payloadd.title,[Validators.required]),
      start:new FormControl('',[Validators.required]),
      end:new FormControl('',[Validators.required]),
      job: new FormControl(this.payloadd.job,[Validators.required]),
      address:new FormControl(this.payloadd.address,[Validators.required]),
   });
  }
  getEvent(){
    return this.techService.getEventById(this.payload).subscribe(resultat => {
       this.event = resultat 
   })
 }
  onSubmit(techEventForm:FormGroup){
    this.submitted = true;
    this.error = '';
    if (techEventForm.invalid) {
      this.error = 'Invalid data !';
      this.submitted= false;
      return;
    } else if(this.EventForm.value.start>this.EventForm.value.end){
          this.toastr.error('Invalid date rang', "Error")
        }else {
     
        const techEvent = {
          title: this.EventForm.value.title,
          start: this.EventForm.value.start,
          end: this.EventForm.value.end,
          job: this.EventForm.value.job,
          address:this.EventForm.value.address,
        };
        
      this.techService.updateEvent(this.payload,techEvent).subscribe(resultat=>{
        this.toastr.success('Event added successfully', "Success")
        this.activeModal.dismiss();
      })
      //console.log(techEvent)
    }
  }
}
