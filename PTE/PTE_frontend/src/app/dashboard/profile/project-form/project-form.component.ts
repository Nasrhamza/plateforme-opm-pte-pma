import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  providers:[ToastrService]
})
export class ProjectFormComponent {
  @Input('payload') payload!:any
  projectForm!:FormGroup
  
  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private techService:UserServiceService,
    private cvService:CvServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.projectForm = new FormGroup({
      organization: new FormControl('',[Validators.required]),
      title: new FormControl('',[Validators.required]),
      date: new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required]),
    })
  }
  onSubmit(projectForm:FormGroup){
     const project = {
      organization:this.projectForm.value.organization,
      title:this.projectForm.value.title, 
      date:this.projectForm.value.date, 
      description:this.projectForm.value.description, 
      cv:this.payload.cv._id
     }

    if (projectForm){
      this.cvService.addProject(project).subscribe(resultat => {
        this.toastr.success('Project added successfully.' , "Success")
        this.activeModal.close('Project added successfully.' );
        
      })
    }else{
      this.toastr.error('Project submission did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Project submission did not succeed, something went wrong!');
      
    }
  }
}
