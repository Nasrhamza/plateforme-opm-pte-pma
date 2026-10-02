import { Component, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { AddCustomerManagementComponent } from '../add-customer-management/add-customer-management.component';
import { CustomerAffectOledComponent } from '../customer-affect-oled/customer-affect-oled.component';

@Component({
  selector: 'app-customer-add-affect',
  templateUrl: './customer-add-affect.component.html',
  styleUrls: ['./customer-add-affect.component.scss']
})
export class CustomerAddAffectComponent implements OnInit {
  @Input() id_contract;
  @Input() id_folder;
  @Input() mangerAddet;
  @Input() companyName;

  model: any = { type: "", nom: "" }

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private modalService: NgbModal,
    public router: Router

  ) { }

  ngOnInit() {

  }

  openAddOledCustomer() {
    this.activeModal.dismiss()
    const modalRef = this.modalService.open(CustomerAffectOledComponent);
    modalRef.componentInstance.title = 'Assign Customer ';
    modalRef.componentInstance.id_contract = this.id_contract;
    modalRef.componentInstance.mangerAddet = this.mangerAddet;
    modalRef.componentInstance.companyName = this.companyName;
  }

  openAddNewCustomer() {
    this.activeModal.dismiss();
    const modalRef = this.modalService.open(AddCustomerManagementComponent);
    modalRef.componentInstance.title = 'Add Customer ';
    modalRef.componentInstance.id_contract = this.id_contract;
    modalRef.componentInstance.id_folder = this.id_folder;
    modalRef.componentInstance.add = true;
    modalRef.componentInstance.mangerAddet = this.mangerAddet;
  }

}
