import { Component } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LabServiceService } from 'src/app/core/service/lab-service.service';
@Component({
  selector: 'app-virtualisation-environment',
  templateUrl: './virtualisation-environment.component.html',
  styleUrls: ['./virtualisation-environment.component.scss'],
  providers: [ToastrService],

})
export class VirtualisationEnvironmentComponent {
  applicant!:FormGroup
  ressource!:FormGroup
  bookingDate!:FormGroup
  goals!:FormGroup

  labEnv!:any

  isLinear = true;
  constructor(
    private labService:LabServiceService,
    private toastr: ToastrService,
    private router:Router
    ) {}

  ngOnInit() {
    this.applicant = new FormGroup({
      first: new FormControl('',[Validators.required]),
      last: new FormControl('',[Validators.required]),
      email: new FormControl('',[Validators.required, Validators.email]),
      departement: new FormControl('',[Validators.required]),
    });
    this.ressource = new FormGroup({
      type: new FormControl('',[Validators.required]),
      backup: new FormControl('',[Validators.required]),
      ram: new FormControl(0,[Validators.required]),
      disk: new FormControl(0,[Validators.required]),
      processor: new FormControl(0,[Validators.required]),
      dhcp: new FormControl("",[Validators.required]),
    });
    this.bookingDate = new FormGroup({
      start: new FormControl('',[Validators.required]),
      end: new FormControl('',[Validators.required]),
    });
    this.goals = new FormGroup({
      goals: new FormControl('',[Validators.required]),
    });
  }
  

  onSubmit(){
    this.labEnv={
      "firstName":this.applicant.value.first,
      "lastName":this.applicant.value.last,
      "email":this.applicant.value.email,
      "departement":this.applicant.value.departement,
      "type":this.ressource.value.type,
      "backup":this.ressource.value.backup,
      "ram":this.ressource.value.ram,
      "disk":this.ressource.value.disk,
      "processor":this.ressource.value.processor,
      "dhcp":this.ressource.value.dhcp,
      "start":this.bookingDate.value.start,
      "end":this.bookingDate.value.end,
      "goals":this.goals.value.goals,
      "applicant":localStorage.getItem('userId'),
    }
    // console.log(this.labEnv)

    if (this.labEnv && (this.bookingDate.value.start <= this.bookingDate.value.end)){
    this.labService.addLabRequest(this.labEnv).subscribe(resultat => {
      this.toastr.success('Request sent successfully, now you have to wait until the manager accepts your request \n thanks for you patience.' , "Success")
      setTimeout(() => {
        this.router.navigate(["/dashboard/myRequest"])
      }, 600);
      
    })
  }else{
    this.toastr.error('Lab Request did not succeed, something went wrong!' , "Error")
    setTimeout(() => {
      this.router.navigate(["/dashboard/virt-env"])
    }, 600);

  }
  }

}
