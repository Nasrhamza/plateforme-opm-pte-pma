import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/services/shared.service';
import Observer from 'src/app/services/observer';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-hs-spare',
  templateUrl: './add-hs-spare.component.html',
  styleUrls: ['./add-hs-spare.component.scss']
})
export class AddHsSpareComponent implements OnInit {
  @Input() title;
  @Input() currentTicket;
  @Input() currentSender;
  @Input() add: boolean = true; // Used for conditional button label

  selectedType: string = 'soft';
  support: string[] = []; // Will contain values like ['Evernex', 'HPE']
  supportOptions = [
    { label: 'Evernex', value: 'Evernex' },
    { label: 'HPE', value: 'HPE' }
  ];
  selectedSupports: string[] = [];
  selectedExchangeFile: File | null = null;
  fileError: boolean = false;
  equipmentName: string = '';
  caseId: string = '';

  constructor(
    private backendService: BackendService,
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    public router: Router,
  ) { }

  ngOnInit(): void { }

  Onsubmit(form: any): void {
    if (!this.selectedExchangeFile) {
      Swal.fire('Warning', 'Please select a file before submitting', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('ticketId', this.currentTicket._id);
    formData.append('caseId', this.caseId);
    formData.append('file', this.selectedExchangeFile);
    formData.append('technician', this.currentSender._id);
    if (this.selectedType === 'hard') {
      formData.append('supports', JSON.stringify(this.support));
      formData.append('equipmentName', this.equipmentName);
    }
    this.backendService.post(`${environment.apiUrl}/ticket/exchanges`, formData).subscribe(new Observer(
      this.router,// just un class dans angular
      null,//
      true,//relode
      true,//swwet alert
      this.sharedService,//obligtoir si ana reload
      this.activeModal
    ).OBSERVER_POST());
    //   this.backendService.post(`${environment.apiUrl}, ).subscribe({
    //     next: (response: any) => {
    //       Swal.fire('Success', 'Exchanges submitted successfully', 'success');
    //       this.currentTicket = response.rows;
    //       this.resetForm();
    //       this.activeModal.close('Saved');
    //     },
    //     error: (error) => {
    //       console.error(error);
    //       Swal.fire('Error', 'Something went wrong', 'error');
    //     }
    //   });
  }

  onExchangeFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.eml') || fileName.endsWith('.msg')) {
        this.selectedExchangeFile = file;
        this.fileError = false;
      } else {
        this.selectedExchangeFile = null;
        this.fileError = true;
      }
    }
  }
}
