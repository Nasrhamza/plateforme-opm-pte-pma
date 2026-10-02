import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, map, switchMap, tap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { Risk } from 'src/app/core/models/risk.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { RisksService } from 'src/app/core/services/risks.service';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { RiskDetailsDialogComponent } from 'src/app/shared/dialogs/risk-details-dialog/risk-details-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-project-details-risks',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent
  ],
  templateUrl: './project-details-risks.component.html',
  styleUrl: './project-details-risks.component.scss'
})
export class ProjectDetailsRisksComponent implements OnInit{

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _riskService : RisksService,
    public dialog: MatDialog,
    public _message: MessageService,
    private _route : ActivatedRoute,
    private _auth : AuthService
  ){}

  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['title','project', 'user','impact', 'date','actions'];
  risks : Risk[] = [];
  filteredRisks : Risk[] = [];
  dataSource : MatTableDataSource<any> = new MatTableDataSource<any>();
  role = '';
  showEditButton = false;
  loading = false;


  ngOnInit(): void {
    this._auth.authenticatedUser$.subscribe(
      user => {
        if(user){
          this.role = user.roles[0]
        }
      }
    )
    this.fetchRisks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredRisks = this.risks.filter(e => e.title.toLowerCase().includes(filterValue) || e.project.Projectname.toLowerCase().includes(filterValue) || e.project.TeamLeader.fullName.toLowerCase().includes(filterValue));
    this.dataSource =  new MatTableDataSource<Risk>(this.filteredRisks);
  }

  fetchRisks(){
    this.loading = true;
    this._route.parent!.paramMap.pipe(
      map(params => params.get('projectId')),
      switchMap(projectId => {
        if(!projectId) return EMPTY;
        return this._riskService.findAll({ project : projectId })
      })
    ).subscribe(
      res => {
        this.risks = res.data!.risks!;
        this.filteredRisks = this.risks;
        this.refreshMatTable(this.filteredRisks);
        this.loading = false;
      }
    );
  }

  delete(id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._riskService.delete(result.event.data).subscribe(
          res => {
            this._message.showSuccessMessage(res.message);
            this.risks = this.risks.filter(c => c._id !== res.data!._id);
            this.filteredRisks = this.risks;
            this.refreshMatTable(this.filteredRisks);
          }
        )
      })
  }

  showDetails(id : any){
    this.dialog.open(RiskDetailsDialogComponent, { data : { id } });
  }

  refreshMatTable(newData : Risk[]){
    this.dataSource = new MatTableDataSource<Risk>(newData);
    this.dataSource.paginator = this.paginator;
  }

}
