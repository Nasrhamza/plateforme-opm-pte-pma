import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
@Component({
  selector: 'app-edit-summary-form',
  templateUrl: './edit-summary-form.component.html',
  styleUrls: ['./edit-summary-form.component.scss'],
  providers:[ToastrService]

})
export class EditSummaryFormComponent {
  editSummaryForm!:FormGroup
  @Input('payload') payload!:any
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private techService:UserServiceService,
    private cvService:CvServiceService,    
    private toastr: ToastrService) {}
    ngOnInit(){
      this.editSummaryForm = new FormGroup({
        summary: new FormControl(this.payload[0].summary),
      })
    }

  onSubmit(editSummaryForm:FormGroup){
    const summary = {
      summary:this.editSummaryForm.value.summary,
      user:this.payload[0].user
     }

    if (summary){
      this.cvService.updateSummary(summary,this.payload[0]._id).subscribe(resultat => {
        this.toastr.success('Summary updated successfully.' , "Success")
        this.activeModal.close('Summary updated successfully.');
        
      })
    }else{
      this.toastr.error('Summary update did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Summary update failed');
        setTimeout(() => {
          location.reload();        
        }, 900);
    }
  }
}
