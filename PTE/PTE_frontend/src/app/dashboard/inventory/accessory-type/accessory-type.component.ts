import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AccessoryService } from 'src/app/core/service/accessory.service';

@Component({
  selector: 'app-accessory-type',
  templateUrl: './accessory-type.component.html',
  styleUrls: ['./accessory-type.component.scss'],
  providers: [ToastrService]
  
})
export class AccessoryTypeComponent {
    @Input("payload") payload!:any
  accessoryForm!: FormGroup
  accessory:any;
  constructor(
    private toastr: ToastrService,
    private accessoryService : AccessoryService,
    public activeModal: NgbActiveModal,
    
  ) { }

  ngOnInit(): void {
    // this.getAllAccessories()
    this.initForm()
    this.getAccessoryById()
  }
  initForm(){
    this.accessoryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      brand: new FormControl(''),
      model: new FormControl(''),
      serial_number: new FormControl('')
      })
  }
  patchForm(){
        this.accessoryForm.patchValue({
          name: this.accessory.name,
          brand: this.accessory.brand,
          model: this.accessory.model,
          serial_number: this.accessory.serial_number,
        });
    }
  onSubmit(accessoryForm:FormGroup){
    if(this.accessoryForm.value.name === ''){
      this.toastr.error('Please fill out the form correctly!')
    }
    this.accessoryService.editAccessory(this.payload,accessoryForm.value).subscribe(res=>{
      this.accessoryForm.reset()
      this.toastr.success(res.message)
      this.activeModal.close("Accessory updated successfully");
      // this.getAllAccessories()
    })
  }
  // getAllAccessories(){
  //   this.accessoryService.getAllAccessories().subscribe(res=>{
  //     this.accessories = res.data
  //     console.log(this.accessories)
  //   })
  // }
  getAccessoryById(){
    this.accessoryService.getAccessoryById(this.payload).subscribe(res=>{
      this.accessory = res.data
      this.patchForm()
    })
  }
}
