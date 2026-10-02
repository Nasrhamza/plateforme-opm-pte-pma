import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TechEvent } from 'src/app/core/models/techEvent';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { EditTechEventComponent } from '../edit-tech-event/edit-tech-event.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-tech-personal-details-modal',
  templateUrl: './tech-personal-details-modal.component.html',
  styleUrls: ['./tech-personal-details-modal.component.scss']
})
export class TechPersonalDetailsModalComponent {
  @Input('payload') payload!:any
  readonly picsUrl = environment.PICSURL;


  constructor(public activeModal: NgbActiveModal,
            public techService:UserServiceService,
            ) {}
  ngOnInit(): void {
  }
 
}
