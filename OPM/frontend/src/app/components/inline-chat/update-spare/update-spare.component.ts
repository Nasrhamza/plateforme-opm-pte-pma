import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/services/shared.service';
import Observer from 'src/app/services/observer';

@Component({
  selector: 'app-update-spare',
  templateUrl: './update-spare.component.html',
  styleUrls: ['./update-spare.component.scss']
})
export class UpdateSpareComponent implements OnInit {
  @Input() title;
  @Input() currentTicket;
  @Input() currentSender;
  @Input() currentSpare;

  statusOptions = [
    { label: 'Ordred', value: 'Ordred', icon: 'feather icon-shopping-cart', color: 'text-warning' },
    { label: 'Delivered', value: 'Delivered', icon: 'feather icon-check-square', color: 'text-success' },
    { label: 'Installed', value: 'Installed', icon: 'feather icon-cpu', color: 'text-info' },
    { label: 'Stocked', value: 'Stocked', icon: 'feather icon-package ', color: 'text-secondary' }
  ];

  equipmentName: string = '';
  serialNumber: string = '';
  selectedStatus: string = '';
  location: string = '';


  constructor(
    private backendService: BackendService,
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    public router: Router,
  ) { }

  ngOnInit(): void {

    this.equipmentName = this.currentSpare.equipmentName
    this.serialNumber = this.currentSpare.serialNumber
    this.selectedStatus = this.statusOptions.find(opt => opt.value === this.currentSpare.status?.trim())?.value || '';
  }



  Onsubmit(form: any): void {
    const id = this.currentSpare._id
    const formData = new FormData();
    formData.append('ticketId', this.currentTicket._id);
    formData.append('technician', this.currentSender._id);
    formData.append('serialNumber', this.serialNumber);
    formData.append('equipmentName', this.equipmentName);
    formData.append('status', this.selectedStatus);
    formData.append('location', this.location);

    this.backendService.put(`${environment.apiUrl}/spare/updateSpareTicket/${id}`, formData).subscribe(new Observer(
      this.router,// just un class dans angular
      null,//
      true,//relode
      true,//swwet alert
      this.sharedService,//obligtoir si ana reload
      this.activeModal
    ).OBSERVER_POST());
  }
}
