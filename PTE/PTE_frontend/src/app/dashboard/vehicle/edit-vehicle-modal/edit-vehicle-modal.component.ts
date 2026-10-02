import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Vehicle } from 'src/app/core/models/vehicle';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';

@Component({
  selector: 'app-edit-vehicle-modal',
  templateUrl: './edit-vehicle-modal.component.html',
  styleUrls: ['./edit-vehicle-modal.component.scss'],
  providers: [ToastrService],

})
export class EditVehicleModalComponent {
@Input('payload') payload!:Vehicle
vehicleEdittForm!: FormGroup
needCard:boolean = false;
card!:any
constructor(public activeModal: NgbActiveModal,
  private formBuilder: FormBuilder,
  private vehicleService:VehicleServiceService,
  private userService:UserServiceService,
  private toastr: ToastrService) {}

  ngOnInit(){
    this.getCardInfo(this.payload._id)
    this.vehicleEdittForm = new FormGroup({
     model:new FormControl(this.payload.model,[Validators.required]),
     registration_number:new FormControl(this.payload.registration_number,[Validators.required]),
     type:new FormControl(this.payload.type,[Validators.required]),
  });
  }
  needCardYes(){
    this.needCard = true;
    if(this.card){
      this.vehicleEdittForm.addControl("card_number",new FormControl(this.card.card_number,[Validators.required]))
      this.vehicleEdittForm.addControl("balance",new FormControl(this.card.balance,[Validators.required]))
    }else{
      this.vehicleEdittForm.addControl("card_number",new FormControl("",[Validators.required]))
      this.vehicleEdittForm.addControl("balance",new FormControl("",[Validators.required]))
    }
    
  }
  needCardNo(){
    this.needCard = false;
  }
  getCardInfo(vId:any){
    this.vehicleService.getVehicleCard(vId).subscribe((res:any)=> {
      this.card = res.data
    })
  }
  onSubmit(){
    const vehicle = {
      model : this.vehicleEdittForm.value.model,
      registration_number : this.vehicleEdittForm.value.registration_number,
      type : this.vehicleEdittForm.value.type
    }
    if(!this.needCard){
      this.vehicleService.editVehicle(this.payload._id,vehicle as any).subscribe(resultat=>{
        if(!resultat){
          this.toastr.error('oops! something went wrong', 'Error');
          this.activeModal.dismiss('Close click');
        }else {
          this.toastr.success('Vehicle updated successfuly!', 'Success');
          this.activeModal.close('Close click');
        }
      })
    }else{
      this.vehicleService.editVehicle(this.payload._id,this.vehicleEdittForm.value).subscribe(resultat=>{
        if(!resultat){
          this.toastr.error('oops! something went wrong', 'Error');
          this.activeModal.dismiss('Close click');
        }else {
          const card = {
            card_number : this.vehicleEdittForm.value.card_number,
            balance : this.vehicleEdittForm.value.balance,
            vehicle : resultat._id
          }
          this.toastr.success('Vehicle updated successfuly!', 'Success');
          if(this.card){
            this.vehicleService.updateVehicleCard(this.payload._id,card).subscribe((res:any)=>{
              if (res.errors){
                this.toastr.error('oops! something went wrong', 'Error');
                this.activeModal.dismiss('Something went wrong');
              }else {
                this.toastr.success('Card updated successfuly!', 'Success');
                this.activeModal.close('Card updated successfully.');
              }
            })
          }else{
            this.vehicleService.addvehicleCard(card).subscribe((res:any)=>{
              if (res.errors){
                this.toastr.error('oops! something went wrong', 'Error');
                this.activeModal.dismiss('Something went wrong');
              }else {
                this.toastr.success('Card updated successfuly!', 'Success');
                this.activeModal.close('Card updated successfully.');
              }
            })
          }
         
        }
      })
    }
     
  }
}
