import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';
import * as html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-log-modal',
  templateUrl: './log-modal.component.html',
  styleUrls: ['./log-modal.component.scss']
})
export class LogModalComponent {
  @Input('payload') payload:any
  logForm!: FormGroup;
  selectedUserOption!:any
  selectedDateOption!:any
  log!:any
  sortedLog!:any
  readonly picsUrl = environment.PICSURL;
  @ViewChild('pdfContent',{static:false}) pdfContent!: ElementRef;

  constructor(
    public activeModal: NgbActiveModal,
    private userService:UserServiceService
    ) {}
  ngOnInit(){
    this.payload = this.payload.filter(((tech: { departement: string; })=>tech.departement==="System" || tech.departement==="Networking" || tech.departement==="Cyber Security"))
    this.logForm = new FormGroup({
      tech:new FormControl(''),

      dateRangStart:new FormControl(''),
      dateRangEnd:new FormControl(''),

      day:new FormControl(''),
    
   });
  }
  download(){
    const element = this.pdfContent.nativeElement;
    const options = {
      margin: 10,
      filename: 'Tableau-mission.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    //setTimeout(html2pdf().set(options).from(element).save(),6000)
    
    html2pdf(element,options);
  }
  onSubmit(logForm:FormGroup){
    let dd = new Date(logForm.value.day)
    dd.setDate(dd.getDate()+1)

    let data={
      userTypeSelected : this.selectedUserOption,
      dateTypeOption  : this.selectedDateOption,
      tech : logForm.value.tech,
      dateRangStart:logForm.value.dateRangStart,
      dateRangEnd:logForm.value.dateRangEnd,
      day:logForm.value.day,
      day_1: dd
    }
    this.userService.getEventsLog(data).subscribe(res=>{
      this.log=res
      let sorted: any[] = []
      for(let i=0; i<this.log.length; i++){
        sorted = sorted.concat(this.log[i])
      }
      sorted.sort((a: { start: string | number | Date; }, b: { start: string | number | Date; }) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
      this.sortedLog = sorted
    })
  }

}


