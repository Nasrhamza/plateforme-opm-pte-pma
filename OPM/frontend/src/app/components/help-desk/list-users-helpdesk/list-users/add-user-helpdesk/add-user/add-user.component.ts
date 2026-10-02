import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import Observer from 'src/app/services/observer';
import { environment } from 'src/environments/environment';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  @Input() title;
  @Input() add;
  @Input() objectReceved;
  model: any = {}
  password: string;
  FileLogo: any

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router,

  ) { }

  ngOnInit(): void {

    if (this.add) {
      this.model = {}
    } else {
      this.model.firstName = this.objectReceved.firstName
      this.model.lastName = this.objectReceved.lastName
      this.model.email = this.objectReceved.email
      this.model.location = this.objectReceved.location
      this.model.phoneNumber = this.objectReceved.phoneNumber
      this.model.company = this.objectReceved.company
    }
  }
  onAddressSelected(address: string) {
    this.model.location = address;
  }
  fileName: string = '';

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.FileLogo = file;
      this.fileName = file.name;
    }
  }

  Onsubmit(f: NgForm) {
    const formData = new FormData();

    Object.keys(f.value).forEach(key => {
      formData.append(key, f.value[key]);
    });

    if (this.FileLogo) {
      formData.append('file', this.FileLogo);
    }

    if (this.add) {
      this.backendService.post(`${environment.apiUrl}/helpdesk/createUser`, formData).subscribe(new Observer(
        this.router,
        null,
        true,
        true,
        this.sharedService,
        this.activeModal
      ).OBSERVER_POST());
    } else {
      const id = this.objectReceved._id;
      this.backendService.put(`${environment.apiUrl}/helpdesk/updateUser/${id}`, formData).subscribe(new Observer(
        this.router,
        null,
        true,
        true,
        this.sharedService,
        this.activeModal
      ).OBSERVER_PUT());
    }
  }

}
