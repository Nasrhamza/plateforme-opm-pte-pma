import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-skills-form',
  templateUrl: './skills-form.component.html',
  styleUrls: ['./skills-form.component.scss'],
  providers:[ToastrService]
})
export class SkillsFormComponent {
  @Input('payload') payload!:any
  skillsForm!:FormGroup

  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private techService:UserServiceService,
    private cvService:CvServiceService,    
    private toastr: ToastrService) {}
  ngOnInit(){
    this.skillsForm = new FormGroup({
      name: new FormControl('',[Validators.required]),
      level: new FormControl('',[Validators.required]),
    })
  }
  onSubmit(skillsForm:FormGroup){
    const skill = {
      name:this.skillsForm.value.name,
      level:this.skillsForm.value.level, 
      cv:this.payload.cv._id
     }

    if (skill){

      this.cvService.addSkill(skill).subscribe(resultat => {
        this.toastr.success('Skill added successfully.' , "Success")
        this.activeModal.close('Skill added successfully.');

      })
    }else{
      this.toastr.error('Skill submission did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Skill submission did not succeed, something went wrong!' );
      
    }
  }
}
