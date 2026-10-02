import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap, take } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { ProcesV } from 'src/app/core/models/proces.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ProcesService } from 'src/app/core/services/proces.service';
import { AddProcesDialogComponent } from 'src/app/shared/dialogs/add-proces-dialog/add-proces-dialog.component';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ProcesDetailsDialogComponent } from 'src/app/shared/dialogs/proces-details-dialog/proces-details-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-proces-verbaux',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent
  ],
  templateUrl: './proces-verbaux.component.html',
  styleUrl: './proces-verbaux.component.scss'
})
export class ProcesVerbauxComponent {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _procesService : ProcesService,
    public dialog: MatDialog,
    public _message: MessageService,
    private _route : ActivatedRoute,
    private _auth : AuthService
  ){}

  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['title','project', 'type','sender', 'members','actions'];
  proces : ProcesV[] = [];
  filteredProces : ProcesV[] = [];
  dataSource : MatTableDataSource<any> = new MatTableDataSource<any>();
  role = '';
  showEditButton = false;
  loading = false;


  ngOnInit(): void {
    this.fetchProces();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredProces = this.proces.filter(e => e.Titre.toLowerCase().includes(filterValue) || e.Project.Projectname.toLowerCase().includes(filterValue));
    this.dataSource =  new MatTableDataSource<ProcesV>(this.filteredProces);
  }

  addProces(action : 'Add' | 'update', obj : any){
    obj.action = action;
    const dialogRef = this.dialog.open(AddProcesDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.proces = [result.data, ...this.proces];
          this.filteredProces = this.proces;
        }
        if(result.action == 'update'){
          const index = this.proces.findIndex(e => e._id === obj._id)
          this.proces[index] = result.data;
          this.filteredProces = [...this.proces];
        }
        this.refreshMatTable(this.filteredProces);
      }
    });
  }

  fetchProces(){
    this.loading = true;
    this._route.data.pipe(
      take(1),
      switchMap(data => {
        this.role = data['role'];
        if(this.role == 'Team Leader'){
          this.displayedColumns = ['title','project', 'type', 'members','actions'];
        }
        if(data['role'] === 'Admin') {
          this.showEditButton = true;
          return this._procesService.findAll()
        }
        if(data['role'] === 'Engineer') {
          this.showEditButton = false;
          return this._auth.authenticatedUser$.pipe(
            take(1),
            switchMap(user => {
              if(!user) return EMPTY;
              return this._procesService.findAll({ equipe : user.id  })
            })
          )
        }
        if(data['role'] === 'Team Leader') {
          this.showEditButton = false;
          return this._auth.authenticatedUser$.pipe(
            take(1),
            switchMap(user => {
              if(!user) return EMPTY;
              return this._procesService.findAll({ Sender : user.id  })
            })
          )
        }
        return EMPTY;
      })
    ).subscribe(
      res => {
        this.proces = res.data!.proces!;
        this.filteredProces = this.proces;
        this.refreshMatTable(this.filteredProces);
        this.loading = false;
      }
    )    
  }

  delete(id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._procesService.delete(result.event.data).subscribe(
          res => {
            this._message.showSuccessMessage(res.message);
            this.proces = this.proces.filter(c => c._id !== res.data!._id);
            this.filteredProces = this.proces;
            this.refreshMatTable(this.filteredProces);
          }
        )
      })
  }

  showDetails(id : any){
    this.dialog.open(ProcesDetailsDialogComponent, { data : { id }, width : '700px' });
  }

  refreshMatTable(newData : ProcesV[]){
    this.dataSource = new MatTableDataSource<ProcesV>(newData);
    this.dataSource.paginator = this.paginator;
  }
}
