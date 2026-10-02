import { Component, Input, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/services/shared.service';
import Observer from 'src/app/services/observer';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-solution',
  templateUrl: './add-solution.component.html',
  styleUrls: ['./add-solution.component.scss']
})
export class AddSolutionComponent implements OnInit {
  @Input() title;
  @Input() currentTicket;
  @Input() currentSender;
  @Input() add: boolean = true; // Used for conditional button label
  solution: string = '';
  selectedFiles: File[] = [];
  constructor(
    private backendService: BackendService,
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    public router: Router,
  ) { }

  ngOnInit(): void {
  }
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.selectedFiles = Array.from(event.dataTransfer.files);
    }
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }
  Onsubmit(form: NgForm) {
    if (!this.solution || this.solution.trim() === '') {
      Swal.fire('Error', 'Solution cannot be empty', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('ticketId', this.currentTicket._id);
    formData.append('technician', this.currentSender._id);
    formData.append('solution', this.solution);

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
    }

    this.backendService.post(`${environment.apiUrl}/ticket/saveSolution`, formData).subscribe(new Observer(
      this.router,// just un class dans angular
      null,//
      true,//relode
      true,//swwet alert
      this.sharedService,//obligtoir si ana reload
      this.activeModal
    ).OBSERVER_POST());
  }

}
