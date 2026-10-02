import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-edit-experience-form',
  templateUrl: './edit-experience-form.component.html',
  styleUrls: ['./edit-experience-form.component.scss'],
  providers:[ToastrService]

})
export class EditExperienceFormComponent {
  @Input('payload') payload!:any
  editExpForm!:FormGroup
  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router:Router,
    private cvService:CvServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.editExpForm = new FormGroup({
      company: new FormControl(this.payload.company),
      job: new FormControl(this.payload.job),
      start: new FormControl(this.payload.start),
      end: new FormControl(''),
      present: new FormControl(''),      
      task_description: new FormControl(this.payload.task_description),
    })
  }
  onSubmit(editExpForm:FormGroup){
    const experience = {
      company:this.editExpForm.value.company,
      job:this.editExpForm.value.job, 
      task_description:this.editExpForm.value.task_description, 
      start:this.editExpForm.value.start, 
      end:this.editExpForm.value.end,
      present:this.editExpForm.value.present,
      cv:this.payload.cv._id
     }

    if ((experience && (this.editExpForm.value.start < this.editExpForm.value.end))||(experience)){


      this.cvService.updateExperience(experience,this.payload._id).subscribe(resultat => {
        this.toastr.success('Experience updated successfully.' , "Success")
        this.activeModal.close('Experience updated successfully.');
        
      })
    }else{
      this.toastr.error('Experience update did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Experience update did not succeed, something went wrong!' );
       
    }
  }
}
