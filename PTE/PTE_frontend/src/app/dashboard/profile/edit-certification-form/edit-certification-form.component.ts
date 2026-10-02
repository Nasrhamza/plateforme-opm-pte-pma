import { formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CvServiceService } from 'src/app/core/service/cv-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-edit-certification-form',
  templateUrl: './edit-certification-form.component.html',
  styleUrls: ['./edit-certification-form.component.scss'],
  providers: [ToastrService]

})
export class EditCertificationFormComponent {
  @Input('payload') payload!: any
  editCertiForm!: FormGroup
  certDate!: Date
  cert_file!: string
  files: File[] = [];
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private cvService: CvServiceService,
    private router: Router,
    private techService: UserServiceService,
    private toastr: ToastrService) { }
  ngOnInit() {
    this.certDate = new Date(this.payload.date);
    this.editCertiForm = new FormGroup({
      domaine: new FormControl(this.payload.domaine),
      date: new FormControl(formatDate(this.certDate, 'MM-dd-YYYY', 'en')),
      credential: new FormControl(this.payload.credential),
    })
  }
  onSubmit(editCertiForm: FormGroup) {
    const cert_Data = new FormData()

    cert_Data.append("domaine", editCertiForm.value.domaine)
    cert_Data.append("date", editCertiForm.value.date)
    cert_Data.append("credential", editCertiForm.value.credential)
    cert_Data.append("cert_file", this.files[0])
    cert_Data.append("cv", this.payload.cv)
    this.cvService.updateCertification(cert_Data, this.payload._id).subscribe(resultat => {
      if (resultat) {
        this.toastr.success('Certification updated successfully.', "Success")
        this.activeModal.close('Certification updated successfully.');
      }
      else {
        this.toastr.error('Certification update did not succeed, something went wrong!', "Error")
        this.activeModal.dismiss('Certification update did not succeed, something went wrong!');
      }
    })
  }

  onSelect(event: any) {
    //console.log(event);
    this.files.push(...event.addedFiles);
    this.cert_file = this.files[0].name
    // console.log(this.image)
  }

  onRemove(event: any) {
    //console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
