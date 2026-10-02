import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap, tap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { Reclamation } from 'src/app/core/models/reclamation.model';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import { UserService } from 'src/app/core/services/users.service';
import { AddReclamationDialogComponent } from 'src/app/shared/dialogs/add-reclamation-dialog/add-reclamation-dialog.component';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ReclamationDetailsDialogComponent } from 'src/app/shared/dialogs/reclamation-details-dialog/reclamation-details-dialog.component';
import { RespondReclamationDialogComponent } from 'src/app/shared/dialogs/respond-reclamation-dialog/respond-reclamation-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent
  ],
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.scss'
})
export class ReclamationsComponent {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _recalamationService : ReclamationService,
    public dialog: MatDialog,
    public _message: MessageService,
    private _route : ActivatedRoute,
    private _auth : AuthService,
    private _user : UserService,
  ){}

  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['title','type', 'project', 'date','status','client', 'comment', 'actions'];
  reclamations : Reclamation[] = [];
  filteredReclamations : Reclamation[] = [];
  dataSource : MatTableDataSource<Reclamation> = new MatTableDataSource<Reclamation>();
  role = '';
  clients : User[] = [];
  loading = false;


  ngOnInit(): void {
    this.fetchClients();
    this.fetchReclamations();
    this._route.data.subscribe(
      data => {
        this.role = data['role'];
      }
    )
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredReclamations = this.reclamations.filter(e => e.Title.toLowerCase().includes(filterValue));
    this.dataSource =  new MatTableDataSource<Reclamation>(this.filteredReclamations);
  }

  addReclamation(action : 'Add' | 'update', obj : any){
    obj.action = action;
    const dialogRef = this.dialog.open(AddReclamationDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.reclamations = [...this.reclamations, result.data];
          this.filteredReclamations = this.reclamations;
        }
        if(result.action == 'update'){
          const index = this.reclamations.findIndex(e => e._id === obj._id)
          this.reclamations[index] = result.data;
          this.filteredReclamations = [...this.reclamations];
        }
        this.refreshMatTable(this.filteredReclamations);
      }
    });
  }

  addResponse(id : string){
    let obj:any = { id };
    obj.action = 'Add';
    this.dialog.open(RespondReclamationDialogComponent, { data : obj, width : '700px' });
  }

  handleClientSelect(e : any){
    if(e.value.length == 0){
      this.filteredReclamations = this.reclamations;
    }else{
      this.filteredReclamations = this.reclamations.filter(r => r.client._id === e.value);
    }
    this.refreshMatTable(this.filteredReclamations);
  }

  fetchReclamations(){
    this.loading = true;
    this._route.data.pipe(
      switchMap(data =>{
        if(data['role'] == 'Admin'){
          return this._recalamationService.findAll()
        }
        if(data['role'] == 'Client'){
          return this._auth.authenticatedUser$.pipe(
            switchMap(user=>{
              if(!user) return EMPTY;
              return this._recalamationService.findAll({ client : user.id })
            })
          )
        }
        if(data['role'] == 'Team Leader'){
          return this._auth.authenticatedUser$.pipe(
            switchMap(user=>{
              if(!user) return EMPTY;
              return this._recalamationService.findByTeamLeader(user.id)
            })
          )
        }
        if(data['role'] == 'Client'){
          return this._auth.authenticatedUser$.pipe(
            switchMap(user=>{
              if(!user) return EMPTY;
              return this._recalamationService.findAll({ client : user.id })
            })
          )
        }
        return EMPTY;
      })
    ).subscribe(
      res => {
        this.reclamations = res.data!.reclamations!;
        this.filteredReclamations = this.reclamations;
        this.refreshMatTable(this.filteredReclamations);
        this.loading = false;
      }
    )    
  }

  delete(id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._recalamationService.delete(result.event.data).subscribe(
          res => {
            this._message.showSuccessMessage(res.message);
            this.reclamations = this.reclamations.filter(c => c._id !== res.data!._id);
            this.filteredReclamations = this.reclamations;
            this.refreshMatTable(this.filteredReclamations);
          }
        )
      })
  }

  showDetails(id : any){
    this.dialog.open(ReclamationDetailsDialogComponent, { data : { id }, width : '700px'});
  }

  refreshMatTable(newData : Reclamation[]){
    this.dataSource = new MatTableDataSource<Reclamation>(newData);
    this.dataSource.paginator = this.paginator;
  }

  fetchClients(){
    this._auth.authenticatedUser$.pipe(
      switchMap(user=>{
        if(!user) return EMPTY;
        if(user.roles.includes('Team Leader')){
          return this._user.findTeamLeaderClients(user.id)
        }
        if(user.roles.includes('Admin')){
          return this._user.findAll({ roles : ['Client'] })
        }
        return EMPTY;
      })
    ).subscribe(
      (res : any) => {
        if(res.data!.users){
          this.clients = res.data!.users
        }else{
          this.clients = res.data!
        }
      }
    )
  }
}
