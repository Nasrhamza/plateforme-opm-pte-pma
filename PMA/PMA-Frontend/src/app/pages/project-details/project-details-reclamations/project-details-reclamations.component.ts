import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, map, switchMap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { Reclamation } from 'src/app/core/models/reclamation.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ReclamationDetailsDialogComponent } from 'src/app/shared/dialogs/reclamation-details-dialog/reclamation-details-dialog.component';
import { RespondReclamationDialogComponent } from 'src/app/shared/dialogs/respond-reclamation-dialog/respond-reclamation-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-project-details-reclamations',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent
  ],
  templateUrl: './project-details-reclamations.component.html',
  styleUrl: './project-details-reclamations.component.scss'
})
export class ProjectDetailsReclamationsComponent implements OnInit, AfterViewInit{

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _reclamationService : ReclamationService,
    private _authService : AuthService,
    public dialog: MatDialog,
    private _message: MessageService,
    private _route: ActivatedRoute,
  ){}

  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['title','type', 'date','status','client', 'comment', 'actions'];
  reclamations : Reclamation[] = [];
  filteredReclamations : Reclamation[] = [];
  dataSource : MatTableDataSource<Reclamation> = new MatTableDataSource<Reclamation>();
  role = '';
  loading = false;
  currentUserId: string | null = null;

  ngOnInit(): void {
    this.fetchReclamations();
    this._authService.authenticatedUser$.subscribe(
      user=>{
        if(user){
          this.currentUserId = user?.id;
          this.role = user.roles[0]
        }
      }
    )
  }

  addResponse(id : string){
    let obj:any = { id };
    obj.action = 'update';
    this.dialog.open(RespondReclamationDialogComponent, { data : obj, width : '700px' });
  }


  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  delete(id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._reclamationService.delete(result.event.data).subscribe(
          res => {
            this._message.showSuccessMessage(res.message);
            this.reclamations = this.reclamations.filter(c => c._id !== res.data!._id);
            this.filteredReclamations = this.reclamations;
            this.refreshMatTable();
          }
        )
      })
  }


  showDetails(id : any){
    this.dialog.open(ReclamationDetailsDialogComponent, { data : { id }, width : '700px'});
  }

  fetchReclamations(){
    this.loading = true;
    this._route.parent!.paramMap.pipe(
      map(params => params.get('projectId')),
      switchMap(projectId => {
        if(!projectId) return EMPTY;
        return this._reclamationService.findByProject(projectId)
      })
    ).subscribe(
      res => {
        this.reclamations = res.data!.reclamations;
        this.filteredReclamations = res.data!.reclamations;
        this.refreshMatTable()
        this.loading = false;
      }
    )
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredReclamations = this.reclamations.filter(e => e.Title.toLowerCase().includes(filterValue));
    this.dataSource =  new MatTableDataSource<Reclamation>(this.filteredReclamations);
  }
  
  refreshMatTable(){
    this.dataSource = new MatTableDataSource<Reclamation>(this.filteredReclamations);
    this.dataSource.paginator = this.paginator;
  }

}
