import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-education-form',
  templateUrl: './education-form.component.html',
  styleUrls: ['./education-form.component.scss'],
  providers:[ToastrService]

})
export class EducationFormComponent {
  @Input('payload') payload!:any
  EducationForm!:FormGroup
  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private techService:UserServiceService,
    private cvService:CvServiceService,
    private router:Router,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.EducationForm = new FormGroup({
      establishment: new FormControl('',[Validators.required]),
      section: new FormControl('',[Validators.required]),
      diploma: new FormControl('',[Validators.required]),
      year_start: new FormControl('',[Validators.required]),
      year_end: new FormControl(''),
      present: new FormControl(''),
    })
  }
  onSubmit(EducationForm:FormGroup){
    const education = {
      establishment:this.EducationForm.value.establishment,
      section:this.EducationForm.value.section, 
      diploma:this.EducationForm.value.diploma, 
      year_start:this.EducationForm.value.year_start, 
      year_end:this.EducationForm.value.year_end, 
      present:this.EducationForm.value.present, 
      cv:this.payload.cv._id
     }

    if ((EducationForm && (this.EducationForm.value.year_start < this.EducationForm.value.year_end)) || (EducationForm)){

      this.cvService.addEducation(education).subscribe(resultat => {
        this.toastr.success('Education added successfully.' , "Success")
        this.activeModal.close('Education added successfully.');
        
      })
    }else{
      this.toastr.error('Education submission did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Education submission did not succeed, something went wrong!');
     
    }
  }
}
