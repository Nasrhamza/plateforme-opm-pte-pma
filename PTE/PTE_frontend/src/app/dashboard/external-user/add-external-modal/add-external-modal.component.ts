import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-add-external-modal',
  templateUrl: './add-external-modal.component.html',
  styleUrls: ['./add-external-modal.component.scss'],
  providers:[ToastrService]
})
export class AddExternalModalComponent {
  externalForm!: FormGroup;
  files: File[] = [];
  certifs : File[]=[]
  externals!:any
  loading!:boolean

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private userService:UserServiceService,
    private toastr: ToastrService) {}
  
    ngOnInit(){
      this.loading=false
      this.externalForm = new FormGroup({
        fname: new FormControl('', [Validators.required]),
        lname: new FormControl('', [Validators.required]),
        departement:new FormControl(['',Validators.required]),
        // switch: new FormControl(false),
      })
  }

  onSubmit(externalForm:FormGroup){
    this.loading=true
    const externalData = new FormData()
    externalData.append("fname", externalForm.value.fname)
    externalData.append("lname", externalForm.value.lname)
    externalData.append("departement", externalForm.value.departement)
    for (var i = 0; i < this.files.length; i++) {
      externalData.append("external_docs", this.files[i]);
    }
    this.userService.addExternal(externalData).subscribe(res=>{
      this.externals = res
      this.toastr.success('Success','External user added successfully!');
      this.activeModal.close('External added successfully');
    })

    this.loading=false

  }

  onSelect(event:any) {
    this.files.push(...event.addedFiles);
  }
  
  onRemove(event:any) {
    this.files.splice(this.files.indexOf(event), 1);
  }
}
