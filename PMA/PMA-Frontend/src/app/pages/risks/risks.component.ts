import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap, take } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { Risk } from 'src/app/core/models/risk.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { RisksService } from 'src/app/core/services/risks.service';
import { AddRiskDialogComponent } from 'src/app/shared/dialogs/add-risk-dialog/add-risk-dialog.component';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { RiskDetailsDialogComponent } from 'src/app/shared/dialogs/risk-details-dialog/risk-details-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-risks',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent
  ],
  templateUrl: './risks.component.html',
  styleUrl: './risks.component.scss'
})
export class RisksComponent {
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

  addRisk(action : 'Add' | 'update', obj : any){
    obj.action = action;
    const dialogRef = this.dialog.open(AddRiskDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.risks = [...this.risks, result.data];
          this.filteredRisks = this.risks;
        }
        if(result.action == 'update'){
          const index = this.risks.findIndex(e => e._id === obj._id)
          this.risks[index] = result.data;
          this.filteredRisks = [...this.risks];
        }
        this.refreshMatTable(this.filteredRisks);
      }
    });
  }

  fetchRisks(){
    this.loading = true;
    this._route.data.pipe(
      take(1),
      switchMap(data => {
        this.role = data['role'];
        if(this.role == 'Client'){
          this.displayedColumns = ['title','project','impact', 'date','actions'];
        }
        if(data['role'] === 'Admin') {
          this.showEditButton = true;
          return this._riskService.findAll()
        }
        //find risks by users
        // if(data['role'] === 'Engineer') {
        //   this.showEditButton = false;
        //   return this._auth.authenticatedUser$.pipe(
        //     take(1),
        //     switchMap(user => {
        //       if(!user) return EMPTY;
        //       return this._riskService.findAll({ equipe : user.id  })
        //     })
        //   )
        // }
        if(data['role'] === 'Team Leader') {
          return this._auth.authenticatedUser$.pipe(
            take(1),
            switchMap(user => {
              if(!user) return EMPTY;
              return this._riskService.findAll({ user : user.id  })
            })
          )
        }
        return EMPTY;
      })
    ).subscribe(
      res => {
        this.risks = res.data!.risks!;
        this.filteredRisks = this.risks;
        this.refreshMatTable(this.filteredRisks);
        this.loading = false;
      }
    )    
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
    this.dialog.open(RiskDetailsDialogComponent, { data : { id }, width : '700px' });
  }

  refreshMatTable(newData : Risk[]){
    this.dataSource = new MatTableDataSource<Risk>(newData);
    this.dataSource.paginator = this.paginator;
  }
}
