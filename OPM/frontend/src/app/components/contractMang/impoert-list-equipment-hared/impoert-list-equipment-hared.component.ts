import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CsvParserService } from 'src/app/services/csv-parser.service';
import { Equipmenthared } from 'src/app/services/equipmenthared.model';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-impoert-list-equipment-hared',
  templateUrl: './impoert-list-equipment-hared.component.html',
  styleUrls: ['./impoert-list-equipment-hared.component.scss']
})
export class ImpoertListEquipmentHaredComponent implements OnInit {
  @Input() title;
  @Input() _id;
  @Input() add;
  model: any = {}
  fileName: string = 'Choose file CSV';
  csvfile: any;
  equipments: Equipmenthared[] = [];

  constructor(

    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private csvParserService: CsvParserService,
    public router: Router,
    private _store: StoreService,


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
    const fileUrl = `${environment.SERVER_URL}/assets/Template.csv`;
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', fileUrl);
    link.setAttribute('download', 'CSV_template_for_hard_equipment.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  Onsubmit(f: NgForm) {
    const payload = { equipmentsList: this.equipments, _id: this._id };
    this._store.addImportEquipmentHard(payload)
    this.activeModal.close();
  }

  importCSV(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.csvParserService.parseCsvHared(file).then((data: Equipmenthared[]) => {
        this.equipments = data;
      }).catch((error) => {
        alert(error)
        console.error('Error parsing CSV file:', error);
      });
    }
  }
}
