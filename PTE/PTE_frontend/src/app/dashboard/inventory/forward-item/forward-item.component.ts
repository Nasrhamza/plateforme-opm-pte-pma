import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { AccessoryService } from 'src/app/core/service/accessory.service';
import { EquipmentService } from 'src/app/core/service/equipment.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-forward-item',
  templateUrl: './forward-item.component.html',
  styleUrls: ['./forward-item.component.scss'],
  providers: [ToastrService]
})
export class ForwardItemComponent {
  forwardForm!: FormGroup;
  users: User[] = []
  @Input("payload") payload!:any
  
  constructor(
     private toastr: ToastrService,
      private equipmentService : EquipmentService,
      private accessoryService : AccessoryService,
      private userService: UserServiceService,
      public activeModal: NgbActiveModal,
  ) { }
  ngOnInit() {
    this.initForm()
    this.getAllUsers()
  }

  initForm(){
    this.forwardForm = new FormGroup({
      user: new FormControl('', [Validators.required]),
    })
  }
  onSubmit(forwardForm:FormGroup){
    if(this.payload.action==='equipment'){
      this.equipmentService.forwardEquipment(this.payload.equipment._id,{user : forwardForm.value.user}).subscribe(res=>{
        this.toastr.success('Equipment forwarded successfully')
        this.activeModal.close("Equipment forwarded successfully");
      })
    }else{

      this.accessoryService.forwardAccessory(this.payload.accessory._id,{user : forwardForm.value.user}).subscribe(res=>{
        this.toastr.success('Accessory forwarded successfully')
        this.activeModal.close("Accessory forwarded successfully");
      })
    }
  }
  getAllUsers() {
    this.userService.getEmployees().subscribe(res => {
      this.users = res
      this.users = this.users.filter(user => user.external !== true)
    })
  }
}
