import { Component, HostListener, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, SortType } from '@swimlane/ngx-datatable';
import { ResultsService } from 'src/app/core/service/results.service';
import { environment } from 'src/environments/environment.development';
import { SelectedUserResultComponent } from '../selected-user-result/selected-user-result.component';
import { QuizService } from 'src/app/core/service/quiz.service';

@Component({
  selector: 'app-selected-intern',
  templateUrl: './selected-intern.component.html',
  styleUrls: ['./selected-intern.component.scss']
})
export class SelectedInternComponent {
  @Input('payload') payload!: any
internResults!:any[]
internResults_temp!:any[]
readonly picsUrl = environment.INTERN_IMAGE_URL;
readonly cvUrl = environment.INTERN_CV_URL;
loadingIndicator! :boolean
reorderable = true;
SortType = SortType;
scrollBarHorizontal = window.innerWidth < 1200;
@ViewChild('table') table!: DatatableComponent;
userRole!:string;


  constructor(
    private resultService : ResultsService,
    private modalService: NgbModal,
    private quizService : QuizService,

  ){  }
  ngOnInit(): void {
    this.getAllSelectedInterns()
    this.userRole = localStorage.getItem("roles")!
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
  getAllSelectedInterns(){
    this.resultService.getAllSelectedInterns().subscribe(res=>{
      this.internResults=res.data
      this.internResults_temp=res.data

    })
  }
  openCV(file:string){
    window.open(this.cvUrl + file, '_blank')
  }
  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.internResults_temp.filter(function (d: any) {
      return d.firstName.toLowerCase().indexOf(val) !== -1 || 
             d.lastName.toLowerCase().indexOf(val) !== -1 || 
             d.email.toLowerCase().indexOf(val) !== -1 || 
             d.departement.toLowerCase().indexOf(val) !== -1 || 
             !val;
    });

    // update the rows
    this.internResults = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
}
