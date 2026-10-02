import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-add-update-equipemont',
  templateUrl: './add-update-equipemont.component.html',
  styleUrls: ['./add-update-equipemont.component.scss']
})
export class AddUpdateEquipemontComponent implements OnInit {
  @Input() title: string;
  @Input() id_Sites: string;
  @Input() id_contract: string;
  @Input() add: boolean;
  @Input() equipement: any;

  model: any = { supports: [] };
  listTypeSupport: any = [];
  dateError: string = '';
  showSecondSupport: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    private _store: StoreService,
    public router: Router
  ) { }

  ngOnInit() {
    this.getListSupport(this.id_contract);

    if (this.add) {
      this.model = {};
    } else {
      this.model.nomPice = this.equipement.nomPice;
      this.model.SN = this.equipement.SN;
      this.model.endDateContract = new Date(this.equipement.endDateContract).toLocaleDateString('en-CA');;
      this.model.TypeSupport1 = this.equipement.TypeSupport[0].type._id;
      this.model.startDateSupport1 = new Date(this.equipement.TypeSupport[0].startDateSupport).toLocaleDateString('en-CA');
      this.model.endDateSupport1 = new Date(this.equipement.TypeSupport[0].endDateSupport).toLocaleDateString('en-CA');  // Ensure the end date is properly formatted
      if (this.equipement.TypeSupport[1]) {
        this.showSecondSupport = true;
        this.model.TypeSupport2 = this.equipement.TypeSupport[1].type._id;
        this.model.startDateSupport2 = new Date(this.equipement.TypeSupport[1].startDateSupport).toLocaleDateString('en-CA');
        this.model.endDateSupport2 = new Date(this.equipement.TypeSupport[1].endDateSupport).toLocaleDateString('en-CA');
      }
    }
  }
  async getListSupport(contractId: string) {
    this.backendService.get(`${environment.apiUrl}/typeSupport/getAllTypeSupportforContract/${contractId}`)
      .subscribe(
        new Observer().OBSERVER_GET((response) => {
          this.listTypeSupport = response.rows;
        })
      );
  }

  toggleSecondSupport() {
    this.showSecondSupport = !this.showSecondSupport;
  }

  validateDates(): void {
    this.dateError = '';
    const startDate1 = new Date(this.model.startDateSupport1);
    const endDate1 = new Date(this.model.endDateSupport1);

    if (startDate1 > endDate1) {
      this.dateError = 'End Date for Support 1 cannot be earlier than the Start Date.';
      return;
    }

    if (this.showSecondSupport) {
      const startDate2 = new Date(this.model.startDateSupport2);
      const endDate2 = new Date(this.model.endDateSupport2);
      if (startDate2 > endDate2) {
        this.dateError = 'End Date for Support 2 cannot be earlier than the Start Date.';
        return;
      }
    }
  }

  onSubmit(f: NgForm) {
    this.validateDates();
    if (this.dateError) {
      return;
    }
    if (this.add) {
      this._store.addEquipmentHard({ ...f.value }, this.id_Sites, this.id_contract);
    } else {
      this._store.updateEquipmentHard(this.equipement._id, this.id_contract, { ...f.value });
    }
    this.activeModal.close();
  }
}
