import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-add-update-healthcheck',
  templateUrl: './add-update-healthcheck.component.html',
  styleUrls: ['./add-update-healthcheck.component.scss']
})
export class AddUpdateHealthcheckComponent implements OnInit {
  @Input() title;
  @Input() id_contract;
  @Input() add;
  @Input() obj;

  model:any ={}

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    private _store :StoreService,
    public router: Router
  ) { }

  ngOnInit(): void {
    if (this.add) {
      this.model = {}
    } else {
      this.model.designation = this.obj.designation
      this.model.model = this.obj.model
      this.model.SN = this.obj.SN
      this.model.affectation = this.obj.affectation
      this.model.emplacement = this.obj.emplacement
      this.model.adresseIP = this.obj.adresseIP
      this.model.observation = this.obj.observation
      this.model.resources = this.obj.resources
    }
  }

  Onsubmit(f: NgForm) {
    if (this.add) {
     this._store.addHealthCheck(f.value,this.id_contract)
     this.activeModal.close(); 
    } else {
      this._store.updateHealthCheck(f.value,this.obj._id)
     this.activeModal.close()
    }
  }
}
