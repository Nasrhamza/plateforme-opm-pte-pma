import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-download-cv',
  templateUrl: './download-cv.component.html',
  styleUrls: ['./download-cv.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadCVComponent {
  experiences:any
  educations:any
  certifications:any
  skills:any
  projets:any
  languages:any
  user:any
  cv:any
  lisence:string=""
  @Input('payload') payload : any
  @ViewChild('pdfContent',{static:false}) pdfContent!: ElementRef;
  
  constructor(
    public activeModal: NgbActiveModal,
    ) {}
  ngOnInit(){ 
    this.experiences = this.payload.experiences;
    this.educations = this.payload.educations;
    this.certifications = this.payload.certifications;
    this.skills = this.payload.skills;
    this.languages = this.payload.languages;
    this.projets = this.payload.projets;
    this.user = this.payload.user
    this.cv = this.payload.cv
    // console.log(this.languages)
    if(this.user.drivingLisence==true){
      this.lisence="YES"
    }else{
      this.lisence='NO'
    }
   }
  
   
    DownloadCV(){
      const element = this.pdfContent.nativeElement;
      const options = {
        margin : 11,
        filename: 'cv.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf(element,options);
    }
   

}

