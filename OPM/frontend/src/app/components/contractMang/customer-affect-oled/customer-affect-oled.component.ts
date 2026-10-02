import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-customer-affect-oled',
  templateUrl: './customer-affect-oled.component.html',
  styleUrls: ['./customer-affect-oled.component.scss']
})
export class CustomerAffectOledComponent implements OnInit {
  @Input() title;
  @Input() mangerAddet;
  @Input() companyName;
  @Input() id_contract;
  add = true
  listCustomer: any = []
  listCustomerAffected: any = []
  model: any = { clientId: "", typeAccount: "" }
  typeAcc: any;
  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    private _store: StoreService,
    public router: Router

  ) { }


  ngOnInit() {
    this.getListCustomerAffected()

  }
  Onsubmit(f: NgForm) {
    let payload = {};
    if (this.typeAcc == 'Contract manager') {
      payload = {
        _id: this.id_contract,
        client: f.value.clientId,
        role: 'clientManager',
      }
    }
    if (this.typeAcc == 'user') {
      payload = {
        _id: this.id_contract,
        client: f.value.clientId,
        role: 'clientUser',

      }
    }
    this._store.addOldCustomer(payload);
    this.activeModal.dismiss();

  }

  getTypeAccount(event) {
    this.typeAcc = event.target.value
  }
  getListCustomer() {
    this.backendService.get(`${environment.apiUrl}/client/getListClientOldNotAffected/${this.companyName}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listCustomer = response.rows;
        if (this.listCustomerAffected.length != 0) {
          this.listCustomer = this.listCustomer.filter(cli => !this.listCustomerAffected.includes(cli._id));
        }
      })
    );
  }
  getListCustomerAffected() {
    this.backendService.get(`${environment.apiUrl}/client/getListClientDejaAffected/${this.id_contract}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listCustomerAffected = response.rows;
        this.getListCustomer()
      })
    );

  }
}



