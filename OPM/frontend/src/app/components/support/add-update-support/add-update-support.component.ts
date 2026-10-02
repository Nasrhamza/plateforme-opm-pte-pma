import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-update-support',
  templateUrl: './add-update-support.component.html',
  styleUrls: ['./add-update-support.component.scss']
})
export class AddUpdateSupportComponent implements OnInit {
  @Input() title;
  @Input() add;
  @Input() objectReceved;
  model: any = {}
  listTypeSupport: any = []
  FileLogo: any
  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,

    private backendService: BackendService,
    public router: Router

  ) { }


  ngOnInit() {
    if (this.add) {
      this.model = {}
    } else {
      this.model.supportName = this.objectReceved.supportName
      this.model.supportEmail = this.objectReceved.supportEmail
    }
  }

  Onsubmit(f: NgForm) {
    if (this.add) {
      const payload = { ...f.value };
      const fd = new FormData();
      fd.append('supportName', this.model.supportName)
      fd.append('supportEmail', this.model.supportEmail)
      fd.append('files', this.FileLogo)
      this.backendService.post(`${environment.apiUrl}/typeSupport/createTypeSupport`, fd).subscribe(new Observer(
        this.router,// just un class dans angular
        null,//
        true,//relode
        true,//swwet alert
        this.sharedService,//obligtoir si ana reload
        this.activeModal
      ).OBSERVER_POST());
    } else {
      const payload = { ...f.value, _id: this.objectReceved._id }
      this.backendService.put(`${environment.apiUrl}/typeSupport/updateTypeSupport`, payload).subscribe(new Observer(
        this.router,// just un class dans angular
        null,//
        true,//relode
        true,//swwet alert
        this.sharedService,//obligtoir si ana reload
        this.activeModal
      ).OBSERVER_PUT());
    }
  }

  updateFileName(event: any) {
    this.FileLogo = event.target.files[0]
    const fileName = event.target.files[0].name;
    const fileLabel = document.getElementById('fileInputLabel');
    if (fileLabel) {
      fileLabel.textContent = fileName;
    }
  }


}
