import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
@Component({
  selector: 'app-edit-skills-form',
  templateUrl: './edit-skills-form.component.html',
  styleUrls: ['./edit-skills-form.component.scss'],
  providers:[ToastrService]

})
export class EditSkillsFormComponent {
  editSkillsForm!:FormGroup
  @Input('payload') payload!:any
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private techService:UserServiceService,
    private cvService:CvServiceService,    
    private toastr: ToastrService) {}
    
  ngOnInit(){
    this.editSkillsForm = new FormGroup({
      name: new FormControl(this.payload.name),
      level: new FormControl(this.payload.level),
    })
  }
  onSubmit(editSkillsForm:FormGroup){ 
    const skill = {
      name:this.editSkillsForm.value.name,
      level:this.editSkillsForm.value.level, 
      cv:this.payload.cv._id
     }

    if (skill){

      this.cvService.updateSkill(skill,this.payload._id).subscribe(resultat => {
        this.toastr.success('Skill updated successfully.' , "Success")
        this.activeModal.close('Skill updated successfully.');
        
      })
    }else{
      this.toastr.error('Skill update did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Skill update did not succeed, something went wrong!');
        
    }
  }
}
