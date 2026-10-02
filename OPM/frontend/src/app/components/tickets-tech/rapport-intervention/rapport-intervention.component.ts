import { Component, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-rapport-intervention',
  templateUrl: './rapport-intervention.component.html',
  styleUrls: ['./rapport-intervention.component.scss']
})
export class RapportInterventionComponent implements OnInit {
  @Input() mytitle;
  @Input() ticketId;
  @Input() add;
  @Input() Obj;
  model: any = {}
  user;

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private backendService: BackendService,
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user;
  }
  
  Onsubmit(f: NgForm) {
    if (this.add) {
      const data = {
        userId: this.user._id,
        ticketId:this.ticketId,
        motif: f.value.motif,
        typeIntervention:f.value.typeIntervention,
        tasks: f.value.tasks,
        followUp: f.value.followUp,
        startDate: f.value.startDate,
        endDate: f.value.endDate,  
        startTime: f.value.startTime,
        endTime: f.value.endTime,  
      };
      this.backendService
        .post(`${environment.apiUrl}/ticket/createRapport`, data)
        .subscribe(
          new Observer(
            this.router, 
            null, 
            true, 
            true, 
            this.sharedService, 
            this.activeModal 
          ).OBSERVER_POST()
        );
    } 
    
  }

}
