import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NetworkRequestService } from 'src/app/core/service/network-request.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-network-requests',
  templateUrl: './network-requests.component.html',
  styleUrls: ['./network-requests.component.scss'],
  providers: [ToastrService]
})
export class NetworkRequestsComponent {
  updateReqForm!:FormGroup
  requests:any[] =[]
  userSelectedRequest!:any
  readonly picsUrl = environment.INTERN_IMAGE_URL;
  user !:any
  request !:any
  userSelected:boolean = false;
  constructor(
    private toastr: ToastrService,
    private networkService: NetworkRequestService
  ) { }


  ngOnInit(): void {
    this.getNetworkRequests()
    this.initForm()
  }
  initForm(){
    this.updateReqForm = new FormGroup({
      ssid: new FormControl('', Validators.required),
      login: new FormControl('', Validators.required),
      password: new FormControl('',Validators.required),
    })
  }
  getNetworkRequests() {
    this.networkService.getUserNetworkRequests().subscribe(res=>{
      this.requests = res.data
    })
  }
  selectUser(req:any){
    this.user = req.user
    this.request = req
    this.userSelected = true
    this.networkService.getUserNetworkRequest(this.user._id).subscribe(res=>{
      this.userSelectedRequest = res.data
    })
  }
  onSubmit(updateReqForm:FormGroup){
     this.networkService.approveNetworkRequest(this.request._id, updateReqForm.value).subscribe(res=>{
      this.toastr.success(res.message,"Success")
      this.updateReqForm.reset()
      this.getNetworkRequests()
     })
  }
}
