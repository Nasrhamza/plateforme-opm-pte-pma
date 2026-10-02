import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap, take } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { User } from 'src/app/core/models/user.model';
import { MessageService } from 'src/app/core/services/message.service';
import { UserService } from 'src/app/core/services/users.service';
import { AddUserDialogComponent } from 'src/app/shared/dialogs/add-user-dialog/add-user-dialog.component';
import { ChangeUserRoleDialogComponent } from 'src/app/shared/dialogs/change-user-role-dialog/change-user-role-dialog.component';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { UpdateUserImageComponent } from 'src/app/shared/dialogs/update-user-image/update-user-image.component';
import { UserDetailsDialogComponent } from 'src/app/shared/dialogs/user-details-dialog/user-details-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, AfterViewInit{

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _users : UserService,
    public dialog: MatDialog,
    public _message: MessageService,
    private _route : ActivatedRoute
  ){}

  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['name','email', 'hiringDate', 'roles', 'actions'];
  users : User[] = [];
  filteredUsers : User[] = [];
  dataSource : MatTableDataSource<User> = new MatTableDataSource<User>();
  showEnableButton = false;
  tableTitle = "All Users";
  role =  ""
  showDetailsButton = true;
  loading = false;

  ngOnInit(): void {
    this.fetchUsers();
    this._route.data.subscribe(
      data => {
        this.tableTitle = data['title'];
      }
    )
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredUsers = this.users.filter(e => e.fullName.toLowerCase().includes(filterValue));
    this.dataSource =  new MatTableDataSource<User>(this.filteredUsers);
  }

  addUser(action : 'Add' | 'update', obj : any){
    obj.action = action;
    const dialogRef = this.dialog.open(AddUserDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.users = [result.data, ...this.users];
          this.filteredUsers = this.users;
        }
        if(result.action == 'update'){
          const index = this.users.findIndex(e => e._id === obj._id)
          this.users[index] = result.data;
          this.filteredUsers = [...this.users];
        }
        this.refreshMatTable(this.filteredUsers);
      }
    });
  }

  fetchUsers(){
    this.loading = true;
    this._route.data.pipe(
      take(1),
      switchMap(data => {
        this.role = data['role']
        if(data['enabled'] && data['page'] === 'signuprequests' ){
          this.showDetailsButton = false;
          this.showEnableButton = true;
          return this._users.findAll({ enabled : data['enabled']})
        }
        if(data['role']){
          return this._users.findAll({ roles : [data['searchedRole']] })
        }
        return EMPTY;
      })
    ).subscribe(
      res => {
        this.users = res.data!.users!;
        this.filteredUsers = this.users;
        this.refreshMatTable(this.filteredUsers);
        this.loading = false;
      }
    )    
  }

  delete(id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
      dialogRef.afterClosed().subscribe((result) => {
        //handle delete here
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._users.deleteUser(result.event.data).subscribe(
          res => {
            this._message.showSuccessMessage(res.message);
            this.users = this.users.filter(c => c._id !== res.data!._id);
            this.filteredUsers = this.users;
            this.refreshMatTable(this.filteredUsers);
          }
        )
      })
  }

  changeRole(user : User){
    const dialogRef = this.dialog.open(ChangeUserRoleDialogComponent, { data : { id : user._id, role: user.roles  }, width : '500px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'update'){
          const index = this.users.findIndex(e => e._id === result.data._id)
          this.users[index] = result.data;
          this.filteredUsers = [...this.users];
        }
        this.refreshMatTable(this.filteredUsers);
      }
    });
  }

  showDetails(id : any){
    this.dialog.open(UserDetailsDialogComponent, { data : { id }, width : '500px' });
  }

  refreshMatTable(newData : User[]){
    this.dataSource = new MatTableDataSource<User>(newData);
    this.dataSource.paginator = this.paginator;
  }

  enableUser(id : string){
    this._users.enableUser(id).subscribe(
      res=>{
        this.users = this.users.filter(u => u._id !== id);
        this.filteredUsers = this.users;
        this.refreshMatTable(this.filteredUsers);
        this._message.showSuccessMessage(res.message);
      }
    )
  }

  updateAvatar(user : User){
    const dialogRef = this.dialog.open(UpdateUserImageComponent, { data : { userID : user._id }, width : '600px'});
    dialogRef.afterClosed().subscribe(
      result => {
        const index = this.users.findIndex(user => user._id === user._id);
        this.users[index].image = `${this.imagesUrl}/${result.data}`;
        this.filteredUsers = this.users;
        this.refreshMatTable(this.filteredUsers);
      }
    )
  }
}