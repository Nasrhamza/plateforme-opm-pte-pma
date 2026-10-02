import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { InternshipOffer } from 'src/app/core/models/InternshipOffer';
import { User } from 'src/app/core/models/user';
import { InternsService } from 'src/app/core/service/interns.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss'],
  providers: [ToastrService],
})
export class OfferDetailsComponent {
  @Input('data') data!:InternshipOffer
  user!:User
  constructor(
    private router :Router,
    private route: ActivatedRoute,
    // public activeModal: NgbActiveModal,
    private userService:UserServiceService,
    private toastr: ToastrService) {}

    ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id')      
      this.getEncadrant()
    }
    getEncadrant(){
      this.userService.getUserById(this.data.encadrant as string).subscribe(res=>{
        this.user = res
      })
    }
}
