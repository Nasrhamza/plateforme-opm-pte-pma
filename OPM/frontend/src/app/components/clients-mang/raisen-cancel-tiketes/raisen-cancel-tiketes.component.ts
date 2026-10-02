import { Component, Input, OnInit } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import Observer from 'src/app/services/observer';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-raisen-cancel-tiketes',
  templateUrl: './raisen-cancel-tiketes.component.html',
  styleUrls: ['./raisen-cancel-tiketes.component.scss']
})
export class RaisenCancelTiketesComponent implements OnInit {
  @Input() title;
  @Input() id_contract;
  @Input() id_ticket;
  model: any = {}

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,

    private backendService: BackendService,
    public router: Router
  
  ) { }

  ngOnInit(): void {
  }
  Onsubmit(f: NgForm) {

    const payload ={...f.value, id:this.id_ticket}
    
     this.backendService
    .put(`${environment.apiUrl}/ticket/deleteTicket`, payload)
    .subscribe(new Observer(
      this.router,// just un class dans angular
         null,//
         true,//relode
         true,//swwet alert
         this.sharedService,//obligtoir si ana reload
         this.activeModal
      ).OBSERVER_PUT());
  }
  }

