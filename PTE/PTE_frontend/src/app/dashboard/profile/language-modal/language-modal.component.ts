import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';

@Component({
  selector: 'app-language-modal',
  templateUrl: './language-modal.component.html',
  styleUrls: ['./language-modal.component.scss'],
  providers:[ToastrService]
})
export class LanguageModalComponent {
  @Input('payload') payload!:any
  languageForm!:FormGroup

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private cvService:CvServiceService,    
    private toastr: ToastrService) {}
  ngOnInit(){
    this.languageForm = new FormGroup({
      name: new FormControl('',[Validators.required]),
      level: new FormControl('',[Validators.required]),
    })
  }
  onSubmit(skillsForm:FormGroup){
    const language = {
      name:this.languageForm.value.name,
      level:this.languageForm.value.level, 
      cv:this.payload.cv._id
     }

    if (language){

      this.cvService.addLanguage(language).subscribe(resultat => {
        this.toastr.success('Language added successfully.' , "Success")
        this.activeModal.close('Language added successfully.');

      })
    }else{
      this.toastr.error('Language submission did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Language submission did not succeed, something went wrong!' );
      
    }
  }
}
