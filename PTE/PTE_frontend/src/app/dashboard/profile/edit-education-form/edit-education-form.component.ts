import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-edit-education-form',
  templateUrl: './edit-education-form.component.html',
  styleUrls: ['./edit-education-form.component.scss'],
  providers:[ToastrService]
})
export class EditEducationFormComponent {
  @Input('payload') payload!:any
  editEducationForm!:FormGroup
  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private techService:UserServiceService,
    private cvService:CvServiceService,
    private router:Router,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.editEducationForm = new FormGroup({
      establishment: new FormControl(this.payload.establishment),
      section: new FormControl(this.payload.section),
      diploma: new FormControl(this.payload.diploma),
      year_start: new FormControl(this.payload.year_start),
      year_end: new FormControl(this.payload.year_end),
      present: new FormControl(),
    })
  }
  onSubmit(EducationForm:FormGroup){
    const education = {
      establishment:this.editEducationForm.value.establishment,
      section:this.editEducationForm.value.section, 
      diploma:this.editEducationForm.value.diploma, 
      year_start:this.editEducationForm.value.year_start, 
      year_end:this.editEducationForm.value.year_end,
      present:this.editEducationForm.value.present,
      cv:this.payload.cv._id
     }

    if ((EducationForm && (this.editEducationForm.value.year_start < this.editEducationForm.value.year_end)) || (EducationForm) ){

      this.cvService.updateEducation(education,this.payload._id).subscribe(resultat => {
        this.toastr.success('Education updated successfully.' , "Success")
        this.activeModal.close('Education updated successfully.');
      })
    }else{
      this.toastr.error('Education update did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Education update did not succeed, something went wrong!');
       
    }
  }
}
