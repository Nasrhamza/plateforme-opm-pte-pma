import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/services/store.service';


@Component({
  selector: 'app-add-update-equipemont-sofet',
  templateUrl: './add-update-equipemont-sofet.component.html',
  styleUrls: ['./add-update-equipemont-sofet.component.scss']
})
export class AddUpdateEquipemontSofetComponent implements OnInit {
  @Input() title;
  @Input() id_Sites;
  @Input() add;
  @Input() equipement;
  @Input() id_contract: string;

  model: any = { type: "", nom: "" }
  listTypeSupport: any = []
  dateError: string = ''; // Property to store date validation error messages
  showSecondSupport: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private _store: StoreService,
    private backendService: BackendService,
    public router: Router

  ) { }

  ngOnInit() {
    this.getListSupport(this.id_contract);

    if (this.add) {
      this.model = {}
    } else {
      this.model.constructure = this.equipement.constructure
      this.model.equipmentName = this.equipement.equipmentName
      this.model.version = this.equipement.version
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
        }));
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

  Onsubmit(f: NgForm) {

    if (this.add) {
      this._store.addEquipmentSoft(f.value, this.id_Sites, this.id_contract)
      this.activeModal.close();
    } else {
      this._store.updateEquipmentSoft(f.value, this.equipement._id, this.id_contract)
      this.activeModal.close()
    }
  }
}
