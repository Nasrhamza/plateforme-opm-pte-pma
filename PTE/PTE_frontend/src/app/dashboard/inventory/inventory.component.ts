import { Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';
import { EquipmentTypeComponent } from './equipment-type/equipment-type.component';
import { AccessoryTypeComponent } from './accessory-type/accessory-type.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccessoryService } from 'src/app/core/service/accessory.service';
import { EquipmentService } from 'src/app/core/service/equipment.service';
import { ForwardItemComponent } from './forward-item/forward-item.component';
import { catchError, tap } from 'rxjs';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  providers: [ToastrService],
})
export class InventoryComponent {
  readonly picsUrl = environment.PICSURL;
  accessoryForm!: FormGroup
  userAccessories: any[] = [];
  equipmentForm!: FormGroup
  userEquipments: any[] = [];

  createEquipment: boolean = false;
  showEquipment: boolean = true;
  createAccessoiry: boolean = false;
  showAccessoiry: boolean = true;
  users: User[] = []
  user!: User;
  userSelected: boolean = false;
  userId!: string
  constructor(
    private userService: UserServiceService,
    private toastr: ToastrService,
    private accessoryService: AccessoryService,
    private equipmentService: EquipmentService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getAllUsers()
    this.initAccessoryForm()
    this.initEquipmentForm()
  }
  initAccessoryForm() {
    this.accessoryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      brand: new FormControl(''),
      model: new FormControl(''),
      serial_number: new FormControl('')
    })
  }
  initEquipmentForm() {
    this.equipmentForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      brand: new FormControl('', [Validators.required]),
      model: new FormControl('', [Validators.required]),
      serial_number: new FormControl('', [Validators.required])
    })
  }
  onSubmitAcc(accessoryForm: FormGroup) {
    if (this.accessoryForm.value.name === '') {
      this.toastr.error('Please fill out the form correctly!')
    }
    let data = {
      name: accessoryForm.value.name,
      brand: accessoryForm.value.brand,
      model: accessoryForm.value.model,
      serial_number: accessoryForm.value.serial_number,
      user: this.userId
    }
    this.accessoryService.createAccessory(data).subscribe(res => {
      this.accessoryForm.reset()
      this.toastr.success(res.message)
      this.getUserItems(this.userId)
    })
  }
  onSubmitEqui(equipmentForm: FormGroup) {
    if (this.equipmentForm.value.name === '') {
      this.toastr.error('Please fill out the form correctly!')
    }
    let data = {
      name: equipmentForm.value.name,
      brand: equipmentForm.value.brand,
      model: equipmentForm.value.model,
      serial_number: equipmentForm.value.serial_number,
      user: this.userId
    }
    this.equipmentService.createEquipment(data).subscribe(res => {
      this.equipmentForm.reset()
      this.toastr.success(res.message)
      this.getUserItems(this.userId)
    })
  }
  getAllUsers() {
    this.userService.getEmployees().subscribe(res => {
      this.users = res
      this.users = this.users.filter(user => user.external !== true)
    })
  }
  // getAllEquipments(){
  //   this.equipmentService.getAllEquipments().subscribe(res=>{
  //     this.equipments = res.data
  //     console.log(this.equipments)
  //   })
  // }
  // getAllAccessories(){
  //   this.accessoryService.getAllAccessories().subscribe(res=>{
  //     this.accessories = res.data
  //     console.log(this.accessories)
  //   })
  // }
  getUserItems(userId: string) {
    this.userId = userId
    this.userSelected = true
    this.userService.getUserById(userId).subscribe(res => {
      this.user = res
    })
    this.equipmentService.getEquipmentByUser(userId).subscribe(res => {
      this.userEquipments = res.data
    })
    this.accessoryService.getAccessoriesByUser(userId).subscribe(res => {
      this.userAccessories = res.data
    })
  }
  toggleCreateAcc() {
    this.createAccessoiry = true
    this.showAccessoiry = false
  }
  toggleShowAcc() {
    this.createAccessoiry = false
    this.showAccessoiry = true
  }
  toggleCreateEqui() {
    this.createEquipment = true
    this.showEquipment = false
  }
  toggleShowEqui() {
    this.createEquipment = false
    this.showEquipment = true
  }
  deleteAccessory(id:string){
    this.accessoryService.deleteAccessory(id).subscribe(res => {
      this.getUserItems(this.user._id!)
    })
  }
  editAccessory(id:string){
    const modalRef: NgbModalRef = this.modalService.open(AccessoryTypeComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=id;
    modalRef.result.then((res)=>{
      this.getUserItems(this.user._id!)
    })
  }
  deleteEquipment(id:string){
    this.equipmentService.deleteEquipment(id).subscribe(res => {
      this.getUserItems(this.user._id!)
      })
  }
  editEquipment(id:string){
    const modalRef: NgbModalRef = this.modalService.open(EquipmentTypeComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=id;
    modalRef.result.then((res)=>{
      this.getUserItems(this.user._id!)
    })
  }
  forwardAccessory(accessory:any,action:string){
    const modalRef: NgbModalRef = this.modalService.open(ForwardItemComponent, {
            ariaLabelledBy: 'modal-basic-title',
            size: 'sm',
            keyboard: false ,
            backdropClass:'light-blue-backdrop'
          });
          modalRef.componentInstance.payload={accessory,action};
          modalRef.result.then((res)=>{
            this.getUserItems(this.user._id!)
          })
  }
  forwardEquipment(equipment:any,action:string){
    const modalRef: NgbModalRef = this.modalService.open(ForwardItemComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'sm',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload={equipment, action};
    modalRef.result.then((res)=>{
      this.getUserItems(this.user._id!)
    })
  }

  
  dowloadFile(id: string) {
    this.equipmentService.downloadUserItems(id)
        .pipe(
            tap((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `fiche_materiel_${this.user.firstName+" "+this.user.lastName}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url); // Cleanup
            }),
            catchError((error) => {
                console.error('Error downloading PDF:', error);
                throw new Error('Failed to download PDF');
            })
        )
        .subscribe(); // Subscription to trigger the observable
}
// downloadFile2() {
//   this.equipmentService.downloadUserItems2()
//       .pipe(
//           tap((blob) => {
//               const url = window.URL.createObjectURL(blob);
//               const link = document.createElement('a');
//               link.href = url;
//               link.download = "user_items.zip"; // Change the filename to a ZIP
//               document.body.appendChild(link);
//               link.click();
//               document.body.removeChild(link);
//               window.URL.revokeObjectURL(url); // Cleanup
//           }),
//           catchError((error) => {
//               console.error('Error downloading ZIP:', error);
//               throw new Error('Failed to download ZIP file');
//           })
//       )
//       .subscribe(); // Trigger the observable
// }

  dowloadAllItems(){
    this.equipmentService.downloadAllItems()
        .pipe(
            tap((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `fiche_inventaire.pdf`;
                link.click();
                window.URL.revokeObjectURL(url); // Cleanup
            }),
            catchError((error) => {
                console.error('Error downloading PDF:', error);
                throw new Error('Failed to download PDF');
            })
        )
        .subscribe(); // Subscription to trigger the observable
  }
}
