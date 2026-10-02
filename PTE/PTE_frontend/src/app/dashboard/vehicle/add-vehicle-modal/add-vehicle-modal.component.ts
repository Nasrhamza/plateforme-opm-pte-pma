import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Vehicle } from 'src/app/core/models/vehicle';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';

@Component({
  selector: 'app-add-vehicle-modal',
  templateUrl: './add-vehicle-modal.component.html',
  styleUrls: ['./add-vehicle-modal.component.scss'],
  providers: [ToastrService],
})
export class AddVehicleModalComponent {
  vehicleAddForm!: FormGroup
  needCard:boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private vehicleService:VehicleServiceService,
    private userService:UserServiceService,
    private toastr: ToastrService) {}
  
    ngOnInit(){
     this.initVehicleForm()
    }
    initVehicleForm(){
      // if(this.needCard){
        this.vehicleAddForm = new FormGroup({
          model:new FormControl('',[Validators.required]),
          registration_number:new FormControl('',[Validators.required]),
          type:new FormControl('',[Validators.required]),
       });
      // }else{
      //   this.vehicleAddForm = new FormGroup({
      //     model:new FormControl('',[Validators.required]),
      //     registration_number:new FormControl('',[Validators.required]),
      //     type:new FormControl('',[Validators.required])
      //     });
      // }
      
    }
    needCardYes(){
      this.needCard = true;
      this.vehicleAddForm.addControl("card_number",new FormControl('',[Validators.required]))
      this.vehicleAddForm.addControl("balance",new FormControl('',[Validators.required]))
    }
    needCardNo(){
      this.needCard = false;
    }
    onSubmit(vehicleEdittForm:FormGroup){
      const vehicle = {
        model : this.vehicleAddForm.value.model,
        registration_number : this.vehicleAddForm.value.registration_number,
        type : this.vehicleAddForm.value.type
      }
      
      if(!this.needCard){
        this.vehicleService.addVehicle(vehicle as Vehicle).subscribe(resultat=>{
          if (resultat.errors){
            this.toastr.error('oops! something went wrong', 'Error');
            this.activeModal.dismiss('Something went wrong');
          }else {
            this.toastr.success('Vehicle added successfuly!', 'Success');
            this.activeModal.close('Vehicle added successfully.');
          }
        })
      }else{
        this.vehicleService.addVehicle(vehicle as Vehicle).subscribe(resultat=>{
          if (resultat.errors){
            this.toastr.error('oops! something went wrong', 'Error');
          }else {
            this.toastr.success('Vehicle added successfuly!', 'Success');
            const card = {
              card_number : this.vehicleAddForm.value.card_number,
              balance : this.vehicleAddForm.value.balance,
              vehicle : resultat._id
            }
            this.vehicleService.addvehicleCard(card).subscribe((res:any)=>{
              if (res.errors){
                this.toastr.error('oops! something went wrong', 'Error');
                this.activeModal.dismiss('Something went wrong');
              }else {
                this.toastr.success('Card attached successfuly!', 'Success');
                this.activeModal.close('Card attached successfully.');
              }
            })
          }
        })
        
        
      }
      
    }
}
