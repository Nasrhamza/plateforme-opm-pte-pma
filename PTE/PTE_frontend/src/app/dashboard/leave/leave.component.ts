import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/service/auth.service';
import { LeaveServiceService } from 'src/app/core/service/leave-service.service';
import { UserServiceService } from 'src/app/core/service/user-service.service';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss'],
  providers: [ToastrService],

})
export class LeaveComponent {
  leaveForm!:FormGroup
  files: File[] = [];
  tempWorkers!:any
  Workers:any[]=[]
  supervisors:any[]=[]
  user:any

  constructor(
    private toastr: ToastrService,
    private router:Router,
    private userService:UserServiceService,
    private leaveService:LeaveServiceService,
    ) {}

  ngOnInit() {
    this.userService.getUserById(localStorage.getItem('userId')!).subscribe(res=>{
      this.user = res as User
    })
    this.userService.getAllTeamLeaders().subscribe(resultat => {
      this.supervisors= resultat
      this.supervisors = this.supervisors.filter(supervisor => supervisor._id !== localStorage.getItem('userId'));
    })
    
      this.leaveForm = new FormGroup({
        type: new FormControl('', [Validators.required]),
        // fullName: new FormControl('', [Validators.required]),
        // email: new FormControl('', [Validators.required, Validators.email]),
        startDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
        supervisor: new FormControl(''),
        note: new FormControl('',[Validators.required]),
      })
    }
  


  onSubmit(){
      const leaveData = new FormData()
      leaveData.append("type", this.leaveForm.value.type)
      leaveData.append("fullName", this.user.firstName+" "+this.user.lastName)
      leaveData.append("email", this.user.email)
      leaveData.append("startDate", this.leaveForm.value.startDate)
      leaveData.append("endDate", this.leaveForm.value.endDate)
      leaveData.append("supervisor", this.leaveForm.value.supervisor)
      leaveData.append("note", this.leaveForm.value.note)
      leaveData.append("certif", this.files[0])
      leaveData.append("applicant", localStorage.getItem('userId')!)
    if (leaveData && (this.leaveForm.value.startDate <= this.leaveForm.value.endDate)){
      // console.log(leaveData)
      this.leaveService.addLeave(leaveData).subscribe(resultat => {
        //console.log("file", this.leaveForm.value.certif[0])
        this.toastr.success('Request sent successfully, now you have to wait until your supervisor accepts your request \n thanks for you patience.' , "Success")
        setTimeout(() => {
          this.router.navigate(["/dashboard/myLeave"])
        }, 600);
        
      })
    }else{
      this.toastr.error('Leave Request did not succeed, something went wrong!' , "Error")
      setTimeout(() => {
        this.router.navigate(["/dashboard/leave"])
      }, 600);
  
    }
  }
  
  onSelect(event:any) {
    this.files.push(...event.addedFiles);
  }
  
  onRemove(event:any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

}
