import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import Observer from 'src/app/services/observer';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-add-spare',
  templateUrl: './add-spare.component.html',
  styleUrls: ['./add-spare.component.scss']
})
export class AddSpareComponent implements OnInit {
  fileurl: string = environment.fileUrl
  @Input() title;
  @Input() add;
  @Input() objectReceved;
  model: any = {}
  listTech
  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.getListTech();
    if (this.add) {
      this.model = {}
    } else {
      console.log(this.objectReceved)
      this.model.equipmentName = this.objectReceved.equipmentName
      this.model.serialNumber = this.objectReceved.serialNumber
      this.model.typeSupport = this.objectReceved.typeSupport
      this.model.owner = this.objectReceved.owner._id 
      this.model.status = this.objectReceved.status
    }
  }

  getListTech(): void {
    this.backendService.get(`${environment.apiUrl}/tech/getListTechnician`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listTech = response.rows.map(tech => ({
          ...tech,
          fullName: `${tech.firstName} ${tech.lastName}`,
          imageUrl: tech.image.fileName
        }));
      })
    );
  }
  onSubmit(f: NgForm) {
    if (this.add) {
      const payload = { ...f.value };
      this.backendService.post(`${environment.apiUrl}/spare/createSpare`, f.value).subscribe(new Observer(
        this.router,// just un class dans angular
        null,//
        true,//relode
        true,//swwet alert
        this.sharedService,//obligtoir si ana reload
        this.activeModal
      ).OBSERVER_POST());
    } else {
      const id = this.objectReceved._id
      const payload = { ...f.value, }
      this.backendService.put(`${environment.apiUrl}/spare/updateSpare/${id}`, payload).subscribe(new Observer(
        this.router,// just un class dans angular
        null,//
        true,//relode
        true,//swwet alert
        this.sharedService,//obligtoir si ana reload
        this.activeModal
      ).OBSERVER_PUT());
    }

  }
}
