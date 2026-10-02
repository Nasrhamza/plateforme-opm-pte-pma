import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EquipmentService } from 'src/app/core/service/equipment.service';

@Component({
  selector: 'app-equipment-type',
  templateUrl: './equipment-type.component.html',
  styleUrls: ['./equipment-type.component.scss'],
  providers: [ToastrService]
})
export class EquipmentTypeComponent {
 @Input("payload") payload!:any

  equipmentForm!: FormGroup
  equipment:any;
  constructor(
    private toastr: ToastrService,
    private equipmentService : EquipmentService,
    public activeModal: NgbActiveModal,
    
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.getEquipmentById()
  }
  initForm(){
    this.equipmentForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      brand: new FormControl('', [Validators.required]),
      model: new FormControl('', [Validators.required]),
      serial_number: new FormControl('', [Validators.required])
      })
  }
  patchForm(){
    this.equipmentForm.patchValue({
      name: this.equipment.name,
      brand: this.equipment.brand,
      model: this.equipment.model,
      serial_number: this.equipment.serial_number,
    });
}
  onSubmit(equipmentForm:FormGroup){
    if(equipmentForm.value.name === ''){
      this.toastr.error('Please fill out the form correctly!')
    }
    this.equipmentService.editEquipment(this.payload,equipmentForm.value).subscribe(res=>{
      this.equipmentForm.reset()
      this.toastr.success(res.message)
      this.activeModal.close("Equipment updated successfully");
    })
  }
  getEquipmentById(){
    this.equipmentService.getEquipmentById(this.payload ).subscribe(res=>{
      this.equipment = res.data
      this.patchForm()
    })
  }
}
