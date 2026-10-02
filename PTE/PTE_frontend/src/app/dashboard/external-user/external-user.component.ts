import { Component, HostListener, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, SortType } from '@swimlane/ngx-datatable';
import { User } from 'src/app/core/models/user';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';
import { AddExternalModalComponent } from './add-external-modal/add-external-modal.component';
import { PreviewDocsModalComponent } from './preview-docs-modal/preview-docs-modal.component';

@Component({
  selector: 'app-external-user',
  templateUrl: './external-user.component.html',
  styleUrls: ['./external-user.component.scss']
})
export class ExternalUserComponent {
  readonly picsUrl = environment.PICSURL;

  rows: User[] = [];
  temp: User[] = [];
  loadingIndicator! :boolean
  reorderable = true;
  SortType = SortType;
  scrollBarHorizontal = window.innerWidth < 1200;
  users!: User[];
  employeesCount!:number
  user!:User;
  userRole:string=""
  @ViewChild('table') table!: DatatableComponent;

  
  constructor(public userService:UserServiceService,private modalService: NgbModal) {}

  ngOnInit(): void {  
    this.userRole = localStorage.getItem("roles")!
    this.loadingIndicator = true
    setTimeout(() => {
      this.getUsers()
    },500)
    
   
  }
  getUsers(){
    this.userService.getEmployees().subscribe(resultat=>{
      this.rows = resultat as User[];
      this.rows = this.rows.filter(row => row._id !== localStorage.getItem('userId') && row.external === true);
      this.temp = resultat;
      this.employeesCount = this.rows.length;
      this.loadingIndicator = false
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row: any) {
    return row.height;
  }
  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d: any) {
      return d.firstName.toLowerCase().indexOf(val) !== -1 || 
             d.lastName.toLowerCase().indexOf(val) !== -1 || 
             d.email.toLowerCase().indexOf(val) !== -1 || 
             d.departement.toLowerCase().indexOf(val) !== -1 || 
             d.isEnabled.toLowerCase()===val || 
             !val;
    });
}


downloadCV(row:any){
  const modalRef: NgbModalRef = this.modalService.open(PreviewDocsModalComponent, {
    ariaLabelledBy: 'modal-basic-title',
    size: 'md',
    keyboard: false,
    backdropClass: 'light-blue-backdrop'
  });
  modalRef.componentInstance.payload = row
  

}

addExternalModal(){
  const modalRef: NgbModalRef = this.modalService.open(AddExternalModalComponent, {
    keyboard: false ,
    backdropClass:'light-blue-backdrop'
  });
  modalRef.result.then((res)=>{
    this.getUsers()
  })   
}

}