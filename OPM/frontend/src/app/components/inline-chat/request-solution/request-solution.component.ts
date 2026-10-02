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
  selector: 'app-request-solution',
  templateUrl: './request-solution.component.html',
  styleUrls: ['./request-solution.component.scss']
})
export class RequestSolutionComponent implements OnInit {
  @Input() title;
  @Input() currentTicket;
  @Input() currentSender;
  description: string = '';

  constructor(
    private backendService: BackendService,
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    public router: Router,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(form: NgForm) {

    const formData = new FormData();
    formData.append('ticketId', this.currentTicket._id);
    formData.append('technician', this.currentSender._id);
    formData.append('description', this.description); 

    this.backendService.post(`${environment.apiUrl}/solution/requestSolution`, formData).subscribe(new Observer(
      this.router,// just un class dans angular
      null,//
      true,//relode
      true,//swwet alert
      this.sharedService,//obligtoir si ana reload
      this.activeModal
    ).OBSERVER_POST());
  }

}
