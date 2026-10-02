import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-certification-form',
  templateUrl: './certification-form.component.html',
  styleUrls: ['./certification-form.component.scss'],
  providers:[ToastrService]
})
export class CertificationFormComponent {
  @Input('payload') payload!:any
  certiForm!:FormGroup
  files: File[] = [];
  cert_file!:any
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private cvService:CvServiceService,
    private router:Router,
    private techService:UserServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
    this.certiForm = new FormGroup({
      domaine: new FormControl('',[Validators.required]),
      date: new FormControl('',[Validators.required]),
      credential: new FormControl('',[Validators.required]),
      cert_file : new FormControl(),
      
    })
  }
  onSubmit(certiForm:FormGroup){
    const cert_Data = new FormData()
   
      cert_Data.append("domaine",certiForm.value.domaine)
      cert_Data.append("date",certiForm.value.date)
      cert_Data.append("credential",certiForm.value.credential)
      cert_Data.append("cert_file",this.files[0])
      cert_Data.append("cv",this.payload.cv._id)
    
      this.cvService.addCertification(cert_Data).subscribe(resultat => {
        if (resultat){
        this.toastr.success('Certification added successfully.' , "Success")
        this.activeModal.close('Certification added successfully.');
    }else{
      this.toastr.error('Certification submission did not succeed, something went wrong!' , "Error")
      this.activeModal.dismiss('Certification submission did not succeed, something went wrong!');
    }
  })
  }

  onSelect(event:any) {
    //console.log(event);
    this.files.push(...event.addedFiles);
    this.cert_file=this.files[0].name
    // console.log(this.image)
  }
  
  onRemove(event:any) {
    //console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
