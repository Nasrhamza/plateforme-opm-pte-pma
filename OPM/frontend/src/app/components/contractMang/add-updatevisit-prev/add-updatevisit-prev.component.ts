import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-updatevisit-prev',
  templateUrl: './add-updatevisit-prev.component.html',
  styleUrls: ['./add-updatevisit-prev.component.scss']
})
export class AddUpdatevisitPrevComponent implements OnInit {
  @Input() mytitle;
  @Input() id_contract;
  @Input() add;
  @Input() obj;
  @Input() _id;
  
  model: any = { type: "", nom: "" }
  listTech:any =[]

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router
  
  ) { 
  }


  ngOnInit() {
    this.getListTech()
    if (this.add) {
      this.model = {}
    } else {
      this.model.nomSite = this.obj.nomSite
      this.model.adress = this.obj.adress
      // this.model.sla = this.objectContract.sla
    }
  }


  Onsubmit(f: NgForm) {
    
    if(this.add){
      const payload={site:{...f.value},_id:""};
      this.backendService
    .post(`${environment.apiUrl}/folder/addSite`, payload)
    .subscribe(new Observer(
      this.router,// just un class dans angular
         null,//
         true,//relode
         true,//swwet alert
         this.sharedService,//obligtoir si ana reload
         this.activeModal
      ).OBSERVER_POST());

    }else{
      const payload ={...f.value,_id:"this.objSites._id"}
      this.backendService
      .put(`${environment.apiUrl}/folder/updateSite`, payload)
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

  getListTech() {
    this.backendService.get(`${environment.apiUrl}/tech/getAllEmployeesByValid/${true}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listTech = response.rows;
      })
    );
  }

}
