import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-add-ticket-helpdesk',
  templateUrl: './add-ticket-helpdesk.component.html',
  styleUrls: ['./add-ticket-helpdesk.component.scss']
})
export class AddTicketHelpdeskComponent implements OnInit {
  fileurl: string = environment.fileUrl;
  @Input() mytitle;
  @Input() helpdesk;
  @Input() add;
  @Input() assign;
  @Input() Obj;
  fileNames: string;
  helpdeskUser
  files: any = [];
  model: any = {};
  modelAdd: any = {};
  listTechs: any = [];
  listEquipments: any = [];
  currentProblems: string[] = [];
  role;
  contractObject: any = {};
  filteredProblems: string[] = [];
  listUsers: any = [];
  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit() {
    this.role = this.authService.getAuthUser().user.authority;
    this.getListUser();
    this.getListTech();


    if (this.add) {
      this.model = {}
    }
    else {
      this.model.technicienId = this.Obj.technicienId.map((tech) => tech._id);
      this.model.title = this.Obj.title;
      this.model.user = this.Obj.clientId._id
      this.model.description = this.Obj.description;
      this.model.supervisor = this.Obj.supervisor._id;
      this.model.location = this.Obj.interventionAdress;
    }
  }
  getListUser() {
    this.backendService.get(`${environment.apiUrl}/helpdesk/getListHelpdeskUser`).subscribe(
      (response: any) => {
        this.listUsers = response.rows.map(e => ({ ...e, fullName: `${e.firstName} ${e.lastName}` }));
      });
  }
  onAddressSelected(address: string) {
    this.model.location = address;
  }
  onUserSelected(clientId: string) {
  const selectedClient = this.listUsers.find((u: any) => u._id === clientId);
  if (selectedClient && selectedClient.location) {
    this.model.location = selectedClient.location;
  } else {
    this.model.location = ''; // clear if no location
  }
}
  getListTech() {
    this.backendService.get(`${environment.apiUrl}/tech/getListTechnician`).subscribe(
      (response: any) => {
        this.listTechs = response.rows;
      });
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
    }

    data.append('title', f.value.title);
    data.append('clientId', this.model.user);
    data.append('description', this.model.description);
    data.append('supervisor', this.model.supervisor);
    data.append('interventionAdress', this.model.location);
    data.append('internalTask', this.model.internalTask ? 'true' : 'false');

    if (Array.isArray(f.value.technicienId)) {
      f.value.technicienId.forEach((id: string | number) => {
        data.append('technicienId[]', id.toString());
      });
    } else if (f.value.technicienId) {
      data.append('technicienId', f.value.technicienId);
    }
    if (this.add) {
      this.backendService.post(`${environment.apiUrl}/ticket/createTicketHelpDesk`, data)
        .subscribe(new Observer(this.router, null, true, true, this.sharedService, this.activeModal).OBSERVER_POST());
    }
    if (!this.add) {
      data.append('_id', this.Obj._id);
      this.backendService.put(`${environment.apiUrl}/ticket/updateTicketHelpdesk`, data)
        .subscribe(new Observer(this.router, null, true, true, this.sharedService, this.activeModal).OBSERVER_PUT());
    }
  }
}
