import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LeaveServiceService } from 'src/app/core/service/leave-service.service';
import * as html2pdf from 'html2pdf.js';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-leave-doc',
  templateUrl: './leave-doc.component.html',
  styleUrls: ['./leave-doc.component.scss'],
  providers: [ToastrService],

})
export class LeaveDocComponent {
  @Input('payload') payload!:any
  @ViewChild('pdfContent',{static:false}) pdfContent!: ElementRef;
  admin!:any
  applicant!:any
  dateFin!:Date
  dateDebut!:Date
  datesDiff!:number
  hours!:number
  currentDate!:any
  readonly sigUrl = environment.SIGNATURE_URL;

  base64AdminSig!: string;
  base64ApplicantSig!: string;
  base64SupervisorSig!: string;

  constructor(
    public activeModal: NgbActiveModal,
    public leaveService:LeaveServiceService,
    private userService:UserServiceService,
    ) {}
  ngOnInit(): void {
    this.loadSupervisorSig()
    this.getApplicant()
    this.getAdmin()
    this.dateDebut = new Date(this.payload.startDate)
    this.dateFin = new Date(this.payload.endDate)
    this.datesDiff = (this.dateFin.getTime() - this.dateDebut.getTime())/ (1000 * 3600 * 24);
    if(this.payload.type==="Authorization"){
      this.hours = (this.dateFin.getTime() - this.dateDebut.getTime())/ (1000 * 60 * 60)
    }
    this.currentDate=new Date()
    
  }


  loadApplicantSig(): void {
    const applicantSigUrl = this.sigUrl+this.applicant.signature;
    // console.log("applicant",applicantSigUrl)
    this.userService.getImage(applicantSigUrl).subscribe(
      (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.base64ApplicantSig = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error => {
        console.error('Error loading image:', error);
      }
    );
  }
  loadSupervisorSig(): void {
    const supervisorSigUrl = this.sigUrl+this.payload.supervisor.signature;
    // console.log('Supervisor', supervisorSigUrl)
    this.userService.getImage(supervisorSigUrl).subscribe(
      (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.base64SupervisorSig = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error => {
        console.error('Error loading image:', error);
      }
    );
  }
  loadAdminSig(): void {
    const adminSigUrl = this.sigUrl+this.admin.signature; 
    // console.log("admin", adminSigUrl)
    this.userService.getImage(adminSigUrl).subscribe(
      (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.base64AdminSig = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error => {
        console.error('Error loading image:', error);
      }
    );
  }


  getAdmin(){
    this.userService.getAdmin().subscribe(res=>{
      this.admin=res
      this.loadAdminSig()
    })
  }
  getApplicant(){
    this.userService.getUserById(this.payload.applicant._id).subscribe(res=>{
      this.applicant = res
      this.loadApplicantSig();
    })
  }
    DownloadLeaveDoc(){
    const element = this.pdfContent.nativeElement;
    const options = {
      margin: 0,
      filename: 'leaveRecipt.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 1.2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf(element,options);
  }
}
