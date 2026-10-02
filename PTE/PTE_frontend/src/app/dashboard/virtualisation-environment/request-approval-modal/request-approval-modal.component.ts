import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { LabServiceService } from 'src/app/core/service/lab-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-request-approval-modal',
  templateUrl: './request-approval-modal.component.html',
  styleUrls: ['./request-approval-modal.component.scss'],
  providers: [ToastrService],
})
export class RequestApprovalModalComponent {
@Input('payload_id') payload_id:any
@Input('payload_lab') payload_lab:any
lab!:any
ressources!:FormGroup
readonly picsUrl = environment.PICSURL;

constructor(
  public activeModal: NgbActiveModal,
  private labService: LabServiceService,
  private toastr: ToastrService,
  private modalService: NgbModal,
  ) {}
ngOnInit(): void {

  this.getLabRequest()
  this.ressources = new FormGroup({
    ram: new FormControl(this.payload_lab.ram, [Validators.required]),
    disk:new FormControl(this.payload_lab.disk,[Validators.required ]),
    processor: new FormControl(this.payload_lab.processor,[Validators.required]),
    ip: new FormControl(),
    ip_start: new FormControl(),
    ip_end: new FormControl(),
    uname: new FormControl("",[Validators.required]),
    password: new FormControl("",[Validators.required]),
    
  })  
  }

  onSubmit(ressources:any){
    if(this.payload_lab.applicant.role!=='STAGIAIRE'){
      this.labService.acceptLabRequest(this.payload_id,ressources.value).subscribe(resultat => {
        if (resultat){  
          this.toastr.success('Lab accepted successfully!' , "Success")
          this.activeModal.close()
        }else{
          this.toastr.error('oops! something went wrong', 'Error');
        }
        })
    }else{
      this.labService.acceptLabRequestIntern(this.payload_id,ressources.value).subscribe(resultat => {
        if (resultat){  
          this.toastr.success('Lab accepted successfully!' , "Success")
          this.activeModal.close()
        }else{
          this.toastr.error('oops! something went wrong', 'Error');
        }
        })
    }
    
  }
  getLabRequest(){
    this.labService.getLabRequest(this.payload_id).subscribe(data =>{
      this.lab = data 
      if(!this.lab){
        this.labService.getLabRequestintern(this.payload_id).subscribe(data =>{
          this.lab = data
        })
      }
    })
    
  }
}
