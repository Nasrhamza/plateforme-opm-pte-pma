import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-add-update-tiketes-customer',
  templateUrl: './add-update-tiketes-customer.component.html',
  styleUrls: ['./add-update-tiketes-customer.component.scss']
})
export class AddUpdateTiketesCustomerComponent implements OnInit {
  fileurl: string = environment.fileUrl
  @Input() mytitle;
  @Input() id_contract;
  @Input() contracts;
  @Input() id_client;
  @Input() add;
  @Input() assign;
  @Input() Obj;
  fileNames: string;

  files: any = []
  model: any = {}
  modelAdd: any = {}
  listClients: any = []
  listEquipment: any = []
  listEquipments: any = []
  listTech: any = []
  role;
  siteId
  contractObject: any = {}
  siteSelected = false;
  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit() {
    this.role = this.authService.getAuthUser().user.authority;
    if (this.role === 'client' && this.contracts) {
      this.getListEquipmentClient()
    } else {
      this.getContractById()
      this.getListEquipe()
    }

    if (this.add) {
      this.model = {}
    } else {
      this.siteSelected = true
      this.model.title = this.Obj.title
      this.model.description = this.Obj.description
      this.model.client = this.Obj.clientId._id
      this.model.technicienId = this.Obj?.technicienId?.map((tech) => tech._id);
      console.log('ObjObjObj', this.Obj)
      if (this.Obj?.equipmentSoftId?._id) {
        this.model.equipment = this.Obj?.equipmentSoftId._id;
      } else if (this.Obj?.equipmentHardId?._id) {
        this.model.equipment = this.Obj.equipmentHardId._id;
      }
    }
  }

  async getContractById() {
    await this.backendService.get(`${environment.apiUrl}/contract/getContractById/${this.id_contract}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.contractObject = response.rows;
        this.getListEquipment()
        this.listClients = response.rows.clients.filter(client => client.role === 'clientUser');

      })
    );
  }
  async getListEquipmentClient() {
    await this.backendService.post(`${environment.apiUrl}/contract/getListEquipmentByMultipleContract`, { clientID: this.id_client }).subscribe(
      new Observer().OBSERVER_GET((response) => {
        console.log('Raw response:', this.id_client);
        const listEquipmentHard = response.rows.listEquipmentHard || [];
        const listEquipmentSoft = response.rows.listEquipmentSoft || [];
        const combinedList = [
          ...listEquipmentHard.map(item => ({
            _id: item._id,
            name: item.nomPice,
            SN: item.SN,
            Type: 'hard',
          })),
          ...listEquipmentSoft.map(item => ({
            _id: item._id,
            name: item.equipmentName,
            SN: item.version,
            Type: 'soft',
          }))
        ];
        this.listEquipment = combinedList;
        console.log('listEquipmentClient', this.listEquipment)

      })
    );
  }

  async getListEquipment() {
    await this.backendService.get(`${environment.apiUrl}/contract/getListEquipmentByContract/${this.id_contract}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        console.log(response.rows)
        const rows = response?.rows;
        if (rows) {
          const listEquipmentHard = rows.listEquipmentHard || [];
          const listEquipmentSoft = rows.listEquipmentSoft || [];
          const combinedList = [
            ...listEquipmentHard.map(item => ({
              _id: item._id,
              name: item.nomPice,
              SN: item.SN,
              Type: 'hard',
            })),
            ...listEquipmentSoft.map(item => ({
              _id: item._id,
              name: item.equipmentName,
              SN: item.version,
              Type: 'soft',
            }))
          ];
          this.listEquipment = combinedList;
        console.log('listEquipmentAdmin', this.listEquipment)

        }
      })
    );
  }
  customSearchFn(term: string, item: any) {
    term = term.toLowerCase();
    return item.name.toLowerCase().includes(term) || item.SN.toLowerCase().includes(term);
  }

  getListEquipe() {
    this.backendService.get(`${environment.apiUrl}/contract/getListEquipeContract/${this.id_contract}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listTech = response.rows.map(row => row.technician);
      })
    );
  }

  onFileSelected(event: any): void {
    this.files = [];
    const input = event.target as HTMLInputElement;
    this.files = input.files;
    if (input.files) {
      const filesArray = Array.from(input.files).map(file => file.name);
      this.fileNames = filesArray.join(', ');
    } else {
      this.fileNames = '';
    }
  }
  Onsubmit(f: NgForm) {
    let data = new FormData();

    if (this.files && this.files.length > 0) {
      for (let index = 0; index < this.files.length; index++) {
        data.append('files', this.files[index]);
      }
    } if (this.role !== 'client') {
      data.append('contractId', this.id_contract)
    };
    data.append('title', f.value.title);
    if (this.role == 'client') {
      data.append('clientId', this.id_client);
    } else
      data.append('clientId', f.value.client);
    data.append('description', f.value.description);
    data.append('equipment', f.value.equipment);

    if (this.add) {
      this.backendService.post(`${environment.apiUrl}/ticket/createTicket`, data)
        .subscribe(new Observer(this.router, null, true, true, this.sharedService, this.activeModal).OBSERVER_POST());
    } else if (!this.add && !this.assign) {
      data.append('_id', this.Obj._id);
      this.backendService.put(`${environment.apiUrl}/ticket/updateTicket`, data)
        .subscribe(new Observer(this.router, null, true, true, this.sharedService, this.activeModal).OBSERVER_PUT());
    }
    if (this.assign) {
      data.append('_id', this.Obj._id);
      if (Array.isArray(f.value.technicienId)) {
        f.value.technicienId.forEach((id: string | number) => {
          data.append('technicienId[]', id.toString());
        });
      } else if (f.value.technicienId) {
        data.append('technicienId', f.value.technicienId);
      }
      this.backendService.put(`${environment.apiUrl}/ticket/assignTicket`, data)
        .subscribe(new Observer(this.router, null, true, true, this.sharedService, this.activeModal).OBSERVER_PUT());
    }
  }

}