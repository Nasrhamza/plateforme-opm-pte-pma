import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-edit-project-form',
  templateUrl: './edit-project-form.component.html',
  styleUrls: ['./edit-project-form.component.scss'],
  providers:[ToastrService]

})
export class EditProjectFormComponent {
  @Input('payload') payload!:any
  editProjectForm!:FormGroup
  
  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private techService:UserServiceService,
    private cvService:CvServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.editProjectForm = new FormGroup({
      organization: new FormControl(this.payload.organization),
      title: new FormControl(this.payload.title),
      date: new FormControl(this.payload.date),
      description: new FormControl(this.payload.description),
    })
  }
  onSubmit(projectForm:FormGroup){
     const project = {
      organization:this.editProjectForm.value.organization,
      title:this.editProjectForm.value.title, 
      date:this.editProjectForm.value.date, 
      description:this.editProjectForm.value.description, 
      cv:this.payload.cv._id
     }

    if (projectForm){
      this.cvService.updateProject(project,this.payload._id).subscribe(resultat => {
        this.toastr.success('Project updated successfully.' , "Success")
        this.activeModal.close('Project updated successfully.' );

      })
    }else{
      this.toastr.error('Project update did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Project update did not succeed, something went wrong!');

    }
  }
}
