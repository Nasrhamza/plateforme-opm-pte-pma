import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { InternsService } from 'src/app/core/service/interns.service';
import { InternshipOffer} from 'src/app/core/models/InternshipOffer';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss'],
  providers: [ToastrService],
})
export class CreateOfferComponent {
  offerForm! : FormGroup
  userId!: string
  user!: User
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private offerService:InternsService,
    private authService:AuthService,
    private toastr: ToastrService) {}

    ngOnInit(): void {
      this.userId = localStorage.getItem('userId')!
      this.initForm()
      this.getCurrentUser()
    }
    getCurrentUser(){
      this.authService.getUser().subscribe(res=>{
        this.user = res
      })
    }
    initForm(){
      this.offerForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        technologies: new FormControl('', [Validators.required]),
        internsNumber: new FormControl('', [Validators.required]),
        period: new FormControl(''),
        expirationDate: new FormControl('',[Validators.required]),
      })
    }
    onSubmit(offerForm:FormGroup){
      const offer = {
        title : offerForm.value.title,
        description : offerForm.value.description,
        technologies : offerForm.value.technologies,
        internsNumber : offerForm.value.internsNumber,
        period : offerForm.value.period,
        expirationDate : offerForm.value.expirationDate,
        departement : this.user.departement,
        encadrant : this.userId,
      }
      this.offerService.addOffer(offer as InternshipOffer).subscribe((resultat:any)=>{
        if(resultat.data){
        this.toastr.success(resultat.message, 'Success');
        this.activeModal.close('Offer added successfully');
      }else{
        this.toastr.error(resultat.message, 'Error');
        this.activeModal.close('Error creating offer');
      }
       
    });
    }
}
