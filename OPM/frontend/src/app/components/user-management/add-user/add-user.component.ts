import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import Observer from 'src/app/services/observer';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  password
  @Input() title;
  @Input() add;
  @Input() objectReceved;
  model = {
    role: '', 
    firstName: '', 
    lastName: '', 
    email: '', 
    contract: '' 
  };
  
  listTypeSupport: any = []
  FileLogo: any
  listContract
  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router,
  ) {  const currentYear: number = new Date().getFullYear();
    this.password = `Connect@${currentYear}`; }

  ngOnInit(): void {
  }

  Onsubmit(f: NgForm) {
    if (this.add) {
      const payload = { ...f.value };
      this.backendService.post(`${environment.apiUrl}/user/createUser`, f.value).subscribe(new Observer(
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
      this.backendService.put(`${environment.apiUrl}/user/updateUser/${id}`, payload).subscribe(new Observer(
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
