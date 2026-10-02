import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-experience-form',
  templateUrl: './experience-form.component.html',
  styleUrls: ['./experience-form.component.scss'],
  providers:[ToastrService]

})
export class ExperienceFormComponent {
  @Input('payload') payload!:any
  expForm!:FormGroup
  present:boolean = false

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router:Router,
    private cvService:CvServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
   
    this.expForm = new FormGroup({
      company: new FormControl('',[Validators.required]),
      job: new FormControl('',[Validators.required]),
      start: new FormControl('',[Validators.required]),
      end: new FormControl(''),
      present: new FormControl(''),
      task_description: new FormControl('',[Validators.required]),
    })
  }

  onSubmit(expForm:FormGroup){
    const experience = {
      company:this.expForm.value.company,
      job:this.expForm.value.job, 
      task_description:this.expForm.value.task_description, 
      start:this.expForm.value.start, 
      end:this.expForm.value.end,
      present:this.expForm.value.present,
      cv:this.payload.cv._id
     }

    if ((experience && (this.expForm.value.start < this.expForm.value.end))||(experience)){

      this.cvService.addExperience(experience).subscribe(resultat => {
        this.toastr.success('Experience added successfully.' , "Success")
        this.activeModal.close('Experience added successfully.');
       
      })
    }else{
      this.toastr.error('Experience submission did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Experience submission did not succeed, something went wrong!');
        
    }
  }
}
