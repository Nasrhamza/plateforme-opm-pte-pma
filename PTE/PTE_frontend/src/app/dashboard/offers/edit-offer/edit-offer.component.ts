import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { InternsService } from 'src/app/core/service/interns.service';
import { InternshipOffer} from 'src/app/core/models/InternshipOffer';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.scss'],
  providers: [ToastrService]
})
export class EditOfferComponent {
  @Input('payload') payload!: InternshipOffer
  offerForm! : FormGroup
  userId!: string

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private offerService:InternsService,
    private toastr: ToastrService) {}

    ngOnInit(): void {
      this.userId = localStorage.getItem('userId')!
      this.initForm();
      if (this.payload) {
        this.setFormValues();
      }
    }
    initForm() {
      this.offerForm = this.formBuilder.group({
        title: ['', [Validators.required]],
        description: ['', [Validators.required]],
        technologies: ['', [Validators.required]],
        internsNumber: ['', [Validators.required]],
        period: [''],
        expirationDate: ['', [Validators.required]],
        departement: ['', [Validators.required]],
      });
    }
    setFormValues() {
      // Ensure the form is initialized before patching values
      if (this.offerForm) {
        // Convert expirationDate to yyyy-mm-dd format if it is a Date object
        let formattedExpirationDate = '';
        if (this.payload.expirationDate) {
          const date = new Date(this.payload.expirationDate);
          formattedExpirationDate = date.toISOString().split('T')[0];  // Extracts 'yyyy-mm-dd'
        }
    
        this.offerForm.patchValue({
          title: this.payload.title,
          description: this.payload.description,
          technologies: this.payload.technologies,
          internsNumber: this.payload.internsNumber,
          period: this.payload.period,
          expirationDate: formattedExpirationDate,  // Patch formatted date
          departement: this.payload.departement
        });
      }
    }    onSubmit(offerForm:FormGroup){
        const offer = {
        title : offerForm.value.title,
        description : offerForm.value.description,
        technologies : offerForm.value.technologies,
        internsNumber : offerForm.value.internsNumber,
        period : offerForm.value.period,
        expirationDate : offerForm.value.expirationDate,
        departement : offerForm.value.departement,
        encadrant : this.userId,
      }
      this.offerService.editOffer(this.payload._id as string,offer as InternshipOffer).subscribe((resultat:any)=>{
        if(resultat.data){
          this.toastr.success(resultat.message,"Success")
          this.activeModal.close('Offer updated successfully');
      }else{
        this.toastr.error(resultat.message, 'Error');
        this.activeModal.close('Error creating offer');
      }
       
    });
    }
}
