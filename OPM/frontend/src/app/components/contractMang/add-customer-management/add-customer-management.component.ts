import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-add-customer-management',
  templateUrl: './add-customer-management.component.html',
  styleUrls: ['./add-customer-management.component.scss']
})
export class AddCustomerManagementComponent implements OnInit {
  @Input() title;
  @Input() id_folder;
  @Input() id_contract;
  @Input() add;
  @Input() objCustomer;
  @Input() mangerAddet;
  
  
  model: any = { type: "", nom: "" }
 
  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private _store :StoreService,
    public router: Router
  
  ) { }

  ngOnInit() {
    // alert(this.mangerAddet)
    if (this.add) {
      this.model = {}
    } else {
      this.model.firstName = this.objCustomer.firstName
      this.model.lastName = this.objCustomer.lastName
      this.model.email = this.objCustomer.email
      this.model.phoneNumber = this.objCustomer.phoneNumber
      this.model.valid =this.objCustomer.valid
    }
  }

  Onsubmit(f: NgForm) {
    if(this.add){
      this._store.addCustomer(this.model.typeAccount,f.value,this.id_folder);
      this.activeModal.dismiss();
    }
    else{
      this._store.updateCustomerUser(f.value,this.objCustomer._id);
      this.activeModal.dismiss();
    }

  }

}
