import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CsvParserService } from 'src/app/services/csv-parser.service';
import { Equipmentsoft } from 'src/app/services/equipmentsoft.model';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/services/store.service';


@Component({
  selector: 'app-impoert-list-equipment-soft',
  templateUrl: './impoert-list-equipment-soft.component.html',
  styleUrls: ['./impoert-list-equipment-soft.component.scss']
})
export class ImpoertListEquipmentSoftComponent implements OnInit {
  @Input() title;
  @Input() _id;
  @Input() add;
  model: any = {}
  fileName: string = 'Choose file CSV';
  csvfile: any;
  equipments: Equipmentsoft[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private csvParserService: CsvParserService,
    private _store :StoreService,
    public router: Router

  ) { }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileName = input.files[0].name;
    }
  }
  ngOnInit() {

  }
  downloadFile(): void {
    const fileUrl = `${environment.SERVER_URL}/assets/TemplateSoftCSV.csv`;
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', fileUrl);
    link.setAttribute('download', 'CSV_template_for_soft_equipment.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  Onsubmit(f: NgForm) {
    if (this._id) {
      const payload = { equipmentsList: this.equipments, _id: this._id };
      this._store.addImportEquipmentSoft(payload)
     this.activeModal.close();
    }
  }

  importCSV(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.csvParserService.parseCsvSoft(file).then((data: Equipmentsoft[]) => {
        this.equipments = data;
      }).catch((error) => {
        console.error('Error parsing CSV file:', error);
      });
    }
  }
}
