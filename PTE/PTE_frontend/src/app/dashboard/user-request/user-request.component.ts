import { Component, HostListener, ViewChild } from '@angular/core';
import { Route, Router } from '@angular/router';
import { DatatableComponent, SortType } from '@swimlane/ngx-datatable';
import { User } from 'src/app/core/models/user';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss']
})
export class UserRequestComponent {
  rows: User[] = [];
  temp: User[] = [];
  employeesCount!:number
  loadingIndicator! :boolean
  SortType = SortType;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  readonly picsUrl = environment.PICSURL;

  @ViewChild('table') table!: DatatableComponent;

  constructor(private router:Router,private userService:UserServiceService) {}
  ngOnInit(): void {  
    this.loadingIndicator=true
    this.userService.getUserRequest().subscribe(resultat=>{
      this.rows = resultat as User[];
      this.temp = resultat;
      this.employeesCount = this.rows.length;
      this.loadingIndicator=false  
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

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  confirmRequest(userID: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, Approve it!',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Confirmed!',
          'Signup request has been confirmed.',
          'success'
        )
        this.userService.confirmUserRequest(userID).subscribe(resultat => {
          this.rows = this.rows.filter(user => user._id !== userID);
        })
      } 
    })
  }
  declineRequest(userID: string) {
    
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Signup request has been deleted.',
          'success'
        )
        this.userService.declineUserRequest(userID).subscribe(resultat => {
          this.rows = this.rows.filter(user => user._id !== userID);
        })
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Signup request is safe :)',
          'error'
        )
      }
    })
  }

}
