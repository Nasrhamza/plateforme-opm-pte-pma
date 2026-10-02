import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-preview-docs-modal',
  templateUrl: './preview-docs-modal.component.html',
  styleUrls: ['./preview-docs-modal.component.scss']
})
export class PreviewDocsModalComponent {
  @Input('payload') payload : any;
  constructor(public activeModal: NgbActiveModal,public userService:UserServiceService){}
  ngOnInit():void{
    //console.log(this.payload)
  }
  downloadFile(doc:any){
    this.userService.downloadfile(doc).subscribe((response: any) => {
    let blob:any = new Blob([response], { type: 'file' });
    const url = window.URL.createObjectURL(blob);
    //window.open(url);
    saveAs(blob, doc);
    }), (error: any) => console.log('Error downloading the file',error),
    () => console.info('File downloaded successfully');
  }
}
