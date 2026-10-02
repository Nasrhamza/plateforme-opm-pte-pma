import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';

@Component({
  selector: 'app-edit-language-modal',
  templateUrl: './edit-language-modal.component.html',
  styleUrls: ['./edit-language-modal.component.scss'],
  providers:[ToastrService]
})
export class EditLanguageModalComponent {
  editLanguagesForm!:FormGroup
  @Input('payload') payload!:any
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private cvService:CvServiceService,    
    private toastr: ToastrService) {}
    
  ngOnInit(){
    this.editLanguagesForm = new FormGroup({
      name: new FormControl(this.payload.name),
      level: new FormControl(this.payload.level),
    })
  }
  onSubmit(editLanguagesForm:FormGroup){ 
    const language = {
      name:this.editLanguagesForm.value.name,
      level:this.editLanguagesForm.value.level, 
      cv:this.payload.cv._id
     }

    if (language){

      this.cvService.updateLanguage(language,this.payload._id).subscribe(resultat => {
        this.toastr.success('Language updated successfully.' , "Success")
        this.activeModal.close('Language updated successfully.');
        
      })
    }else{
      this.toastr.error('Language update did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Language update did not succeed, something went wrong!');
        
    }
  }
}
