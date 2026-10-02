import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AddSpareComponent } from './add-spare/add-spare.component';

@Component({
  selector: 'app-spare',
  templateUrl: './spare.component.html',
  styleUrls: ['./spare.component.scss']
})
export class SpareComponent implements OnInit {
  fileurl: string = environment.fileUrl
  listSpare: any[] = []; // your spares list
  spareCount: number = 0; // number of spares
  searchTerm: string = '';
  page: number = 1;
  pageSize: number = 10;
  pageSizes = [5, 10, 15, 20];
  userId: string = '';
  user
  role: string = '';
  userAuthority: string = '';

  selectedStatus: string = 'all';
  filteredSpares: any[] = [];

  // allFiltredTickets
  // selectedFilter
  // allTickets
  constructor(
    public sahredserv: SharedService,
    private backendService: BackendService,
    private authService: AuthService,
    public sharedService: SharedService,
    public router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user;
    this.userAuthority = this.user.authority;
    this.getAllSpare();
  }

  getAllSpare() {
    this.backendService.get(`${environment.apiUrl}/spare/getAllSpare`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listSpare = response.rows;
        this.filteredSpares = this.listSpare; // initialize
        this.spareCount = this.listSpare.length;
        console.log(this.listSpare, 'listSpare');
      })
    );
  }

  applyStatusFilter() {
    if (this.selectedStatus === 'all') {
      this.filteredSpares = this.listSpare;
    } else {
      this.filteredSpares = this.listSpare.filter(
        (spare) => spare.status === this.selectedStatus
      );
    }
    this.page = 1; // reset pagination
    this.spareCount = this.filteredSpares.length;
  }

  // handleFilter(filter) {
  //   this.selectedFilter = filter;
  //   localStorage.setItem('ticketFilter', filter); // Save filter
  //   if (filter == 'all') {
  //     // this.allFiltredTickets = this.allTickets;
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status !== 'Deleted')
  //   }
  //   else if (filter == 'assigned') {
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Assigned');
  //     this.assignedCount = this.allFiltredTickets.length
  //   }
  //   else if (filter == 'inProgress') {
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'In Progress');
  //     this.inProgressCount = this.allFiltredTickets.length
  //   }
  //   else if (filter == 'onHold') {
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'On Hold');
  //     this.onHoldCount = this.allFiltredTickets.length
  //   }
  //   else if (filter == 'completed') {
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Resolved');
  //   }
  //   else if (filter == 'closed') {
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Closed');
  //   }
  //   else if (filter == 'notAssigned') {
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Not Assigned');
  //   }
  //   else if (filter == 'deleted') {
  //     this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Deleted');
  //   }
  // }

  handleGoToTicket(ticket) {
    console.log("ticket",ticket)
    if (this.userAuthority === 'admin' || this.userAuthority === 'pmo') {
      if (ticket.isHelpdesk) {
        this.router.navigate(['main/test/helpDesk']);
      } else
        this.router.navigate(['main/test/listTickets/detailes', ticket.contractId]);
    } else if (this.userAuthority === 'technician') {
      this.router.navigate(['main/test/ticketsTech/list-tickets']);
    } else if (this.userAuthority === 'assistant') {
      this.router.navigate(['main/test/helpDesk']);
    } else if (this.userAuthority === 'client') {
      this.router.navigate(['main/clientMang/customer-tickets/tiketes-List']);
    }
  }
  openAddSpare() {
    const modalRef = this.modalService.open(AddSpareComponent);
    modalRef.componentInstance.title = 'Add New Spare';
    modalRef.componentInstance.add = true;
  }
  updateSpare(item) {
    const modalRef = this.modalService.open(AddSpareComponent);
    modalRef.componentInstance.title = 'Update Spare';
    modalRef.componentInstance.add = false;
    modalRef.componentInstance.objectReceved = item;
  }
  deleteSpare(id) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this spare?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id };
        const aoiurl = environment.apiUrl + `/spare/deleteSpare`;
        this.backendService.put(aoiurl, obj).subscribe(
          (res: any) => {
            this.listSpare =
              this.listSpare.filter(x => x._id !== res.rows._id);
            Swal.fire({
              title: 'Deleted!',
              text: 'The Spare has been deleted successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          }
        );
      }
    });
  }
  handlePageSizeChange(event: any) {
    this.pageSize = event.target.value;
    this.page = 1;
  }

}
