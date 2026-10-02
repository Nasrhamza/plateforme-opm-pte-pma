import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from "../../../services/store.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-update-sites',
  templateUrl: './add-update-sites.component.html',
  styleUrls: ['./add-update-sites.component.scss']
})
export class AddUpdateSitesComponent implements OnInit {
  @Input() title;
  @Input() _id;
  @Input() add;
  @Input() objSites;
  model: any = { type: "", nom: "", adress: "" };

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    public router: Router,
    private _store: StoreService
  ) { }

  ngOnInit() {
    if (this.add) {
      this.model = {};
    } else {
      this.model.nomSite = this.objSites.nomSite;
      this.model.adress = this.objSites.adress;
    }
  }

  onAddressSelected(address: string) {
    this.model.adress = address;
  }

  Onsubmit(f: NgForm) {
    if (this.add) {
      const payload = { site: { ...f.value }, _id: this._id };
      this._store.createSite(payload).subscribe(
        (res: any) => {
          this.activeModal.close(res.rows)
          Swal.fire({
            title: 'Success!',
            text: 'The Site has been successfully added.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        },
      );
    } else {
      const payload = { ...f.value, _id: this.objSites._id };
      this.backendService
        .put(`${environment.apiUrl}/folder/updateSite`, payload)
        .subscribe((res: any) => {
          this.activeModal.close({ result: res.rows })
        })
    }
  }
}
