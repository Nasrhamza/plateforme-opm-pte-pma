import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { Vehicle } from 'src/app/core/models/vehicle';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';
import { format } from 'date-fns';
import { VehicleEvent } from 'src/app/core/models/vehicleEvent';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
  providers:[ToastrService]
})
export class EditEventComponent {
  @Input('payload') payload!:string
  @Input('payloadd') payloadd!:any

  vehicleEventForm!: UntypedFormGroup;
  vehicleEventFailed!:boolean
  submitted = false;
  error = '';
  drivers!:any
  vehicles!: any
  users!:any
  selectedDate!:any
  event!:any

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private vehicleService:VehicleServiceService,
    private userService:UserServiceService,
    private eventService:VehicleServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.getEvent()
    this.getDrivers()
    this.vehicleEventForm = this.formBuilder.group({
     title :new FormControl(this.payloadd.title,[Validators.required]),
     start:new FormControl(this.payloadd.start,[Validators.required]),
     end:new FormControl(this.payloadd.end,[Validators.required]),
     driver:new FormControl(this.payloadd.driver._id,[Validators.required]),
     destination:new FormControl(this.payloadd.destination,[Validators.required]),
  });
  }
  getDrivers(){
    return this.userService.getAllDrivers().subscribe(resultat => {
        this.drivers=resultat
      })
  }
  getEvent(){
    return this.eventService.getEventById(this.payload).subscribe(resultat => {
       this.event = resultat 
   })
 }
  onSubmit(vehicleEventForm:FormGroup){
    this.submitted = true;
    this.error = '';
    if (vehicleEventForm.invalid) {
      this.error = 'Invalid data !';
      this.submitted= false;
      return;
    } else if(this.vehicleEventForm.value.start>this.vehicleEventForm.value.end){
          this.toastr.error('Invalid date rang', "Error")
        }else {
        const vehicleEvent = {
          title: this.vehicleEventForm.value.title,
          start: this.vehicleEventForm.value.start,
          end: this.vehicleEventForm.value.end,
          driver: this.vehicleEventForm.value.driver,
          destination: this.vehicleEventForm.value.destination,
          applicant: localStorage.getItem("userId"),
        };
        
      this.vehicleService.updateEvent(this.event._id,vehicleEvent as any).subscribe(resultat=>{
        this.toastr.success('Event updated successfully', "Success")
        this.activeModal.dismiss("Event updated successfully");
      })
    }
    
  }
  
}
