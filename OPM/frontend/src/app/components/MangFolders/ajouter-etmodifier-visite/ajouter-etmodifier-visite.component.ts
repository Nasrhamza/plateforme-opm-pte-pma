import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ajouter-etmodifier-visite',
  templateUrl: './ajouter-etmodifier-visite.component.html',
  styleUrls: ['./ajouter-etmodifier-visite.component.scss']
})
export class AjouterEtmodifierVisiteComponent implements OnInit {
  fileurl: string = environment.fileUrl
  listClients;
  @Input() mytitle;
  @Input() add;
  @Input() obj;
  @Input() id_contract;
  @Input() id_folder;
  listTech: any = []
  listSites: any = []
  model: any = {}

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router,
    private _store: StoreService
  ) { }

  ngOnInit(): void {
    this.getClientId();
    this.getListEquipe();

    if (this.add) {
      this.model = {};
    }
    else {
      this.model.title = this.obj.title
      this.model.startDate = this.obj.startDate
      this.model.endDate = this.obj.endDate
      this.model.technicians = this.obj.technicians.map((tech) => tech._id);
      this.model.siteID = this.obj.siteID._id
      this.model.status = this.obj.status
      this.model.clientId = this.obj.clientId

    }
  }

  Onsubmit(f: NgForm) {
    if (this.add) {
      this._store.addVisite(f.value, this.id_contract)
      this.activeModal.close();
    } else {
      this._store.updateVisite(this.obj._id, f.value)
      this.activeModal.close();
    }
  }

  getClientId() {
    this.backendService.get(`${environment.apiUrl}/contract/getContractById/${this.id_contract}`).subscribe(
      (response: any) => {
        if (response?.rows?.clients?.length > 0) {
          this.listClients = response.rows.clients;
          this.listSites = response.rows.listSite;
          // console.log(response.rows)
          // console.log(this.listClients)
        }
      },
      (error) => {
        console.error("Error fetching contract:", error);
      }
    );
  }
  getListEquipe() {
    this.backendService.get(`${environment.apiUrl}/contract/getListEquipeContract/${this.id_contract}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listTech = response.rows.map(item => item.technician);
      })
    );
  }

}
