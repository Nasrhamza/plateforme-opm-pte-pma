import { Component, OnInit, ViewEncapsulation, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import Observer from 'src/app/services/observer';
import Swal from 'sweetalert2';
import { AddUpdateTiketesCustomerComponent } from '../clients-mang/add-update-tiketes-customer/add-update-tiketes-customer.component';
import { map } from 'rxjs/operators';
import { RaisenCancelTiketesComponent } from '../clients-mang/raisen-cancel-tiketes/raisen-cancel-tiketes.component';
import { RapportInterventionComponent } from './rapport-intervention/rapport-intervention.component';
import { FilePreviewComponent } from '../file-preview/file-preview.component';

@Component({
  selector: 'app-tickets-tech',
  templateUrl: './tickets-tech.component.html',
  styleUrls: ['./tickets-tech.component.scss',
    '../../../../node_modules/ngx-bar-rating/themes/br-movie-theme.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class TicketsTechComponent implements OnInit {
  fileurl: string = environment.fileUrl
  public size = 'md-view';
  public showView1 = false;
  public allTickets: any[] = [];
  public allFiltredTickets: any[] = [];
  assignedCount
  inProgressCount
  resolvedCount
  onHoldCount
  notAssignedCount
  closedCount
  deletedCount
  selectedFilter
  public solvedTickets: any[] = [];
  public closedTickets: any[] = [];
  public listTechs: any[] = [];
  public selectedTicketIndex: number | null = null;
  term: string = '';
  userAuthority
  user
  lastScrollTop = 0; // to track last scroll position
  isHidden = false; // flag for visibility
  ticketId;
  id_contract;
  listTickets: any = []
  public rateMovie = 1;
  selectedTicket: any;
  contractFiles: any[] = [];
  contract: any[];
  ticketCount: number = 0;
  page = 1;
  pageSize = 5;
  pageSizes = [5, 10, 15];
  techId;
  tech
  id_client;
  technician = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private backendService: BackendService,
    public sharedService: SharedService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.techId = this.authService.getAuthUser().user._id
    this.tech = this.authService.getAuthUser().user
    const savedFilter = localStorage.getItem('ticketFilter') || 'all';
    this.getListTickets(savedFilter)
    // this.route.queryParams.subscribe(params => {
    //   const ticketId = params['ticketId'];
    //   if (ticketId) {
    //     this.openTicketDetails(ticketId);
    //   }
    // });
  }

  openTicketDetails(ticketId: string): void {
    if (this.allFiltredTickets.length === 0) {
      this.backendService.get(`${environment.apiUrl}/ticket/getAllTicketByTech/${this.techId}`).subscribe(() => {
        this.tryOpenTicketDetails(ticketId);
      });
    } else {
      this.tryOpenTicketDetails(ticketId);
    }
  }

  private tryOpenTicketDetails(ticketId: string): void {
    const ticketIndex = this.allFiltredTickets.findIndex(ticket => ticket._id === ticketId);
    if (ticketIndex !== -1) {
      this.toggleDetails(ticketIndex);
    } else {
      console.error(`Ticket with ID ${ticketId} not found.`);
    }
  }
  handleFilter(filter) {
    this.selectedFilter = filter;
    localStorage.setItem('ticketFilter', filter); // Save filter

    if (filter == 'all') {
      // this.allFiltredTickets = this.allTickets;
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status !== 'Deleted')
    }
    else if (filter == 'assigned') {
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Assigned');
      this.assignedCount = this.allFiltredTickets.length
    }
    else if (filter == 'inProgress') {
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'In Progress');
      this.inProgressCount = this.allFiltredTickets.length
    }
    else if (filter == 'onHold') {
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'On Hold');
      this.onHoldCount = this.allFiltredTickets.length
    }
    else if (filter == 'completed') {
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Resolved');
    }
    else if (filter == 'closed') {
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Closed');
    }
    else if (filter == 'notAssigned') {
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Not Assigned');
    }
    else if (filter == 'deleted') {
      this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status === 'Deleted');
    }
  }
  async getListTickets(filter: string = 'all') {
    await this.backendService.get(`${environment.apiUrl}/ticket/getAllTicketByTech/${this.techId}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.allTickets = response.rows
        console.log(this.allTickets);
        this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status !== 'Deleted')
        this.assignedCount = this.allTickets.filter(ticket => ticket.status === 'Assigned').length
        this.inProgressCount = this.allTickets.filter(ticket => ticket.status === 'In Progress').length
        this.onHoldCount = this.allTickets.filter(ticket => ticket.status === 'On Hold').length;
        this.resolvedCount = this.allTickets.filter(ticket => ticket.status === 'Resolved').length
        this.notAssignedCount = this.allTickets.filter(ticket => ticket.status === 'Not Assigned').length
        this.closedCount = this.allTickets.filter(ticket => (ticket.status === 'Expired' || ticket.status === 'Closed')).length
        this.deletedCount = this.allTickets.filter(ticket => ticket.status === 'Deleted').length
        this.handleFilter(filter); // apply saved filter after loading

      })
    );
  }
  toggleDetails(ticket: any) {
    this.selectedTicket = ticket;
    this.showView1 = true;
  }

  closeDetails() {
    this.showView1 = false;
    this.selectedTicketIndex = null;
  }
  openFilePreview(fileUrl: string, fileType: string) {
    const modalRef = this.modalService.open(FilePreviewComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });
    modalRef.componentInstance.fileUrl = fileUrl.trim();
    modalRef.componentInstance.fileType = fileType;
  }
  filterEquipements(equipements: any[]): any[] {
    return (equipements || []).filter(e => e !== undefined);
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'Deleted': return '#dc3545'; // Red
      case 'Assigned': return '#007bff'; // Blue
      case 'Resolved': return '#28a745'; // Green
      case 'Closed': return '#6c757d'; // Gray
      case 'In Progress': return '#ffc107'; // Yellow
      case 'Not Assigned': return '#ffc107'; // Yellow
      default: return '#ccc'; // Default Gray
    }
  }

  takeTicket(id: string) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to Manage this ticket ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { _id: id, technicienId: this.techId }
        this.backendService.put(`${environment.apiUrl}/ticket/manageTicket`, payload).subscribe(new Observer(
          this.router,// just un class dans angular
          null,//
          true,//relode
          true,//swwet alert
          this.sharedService,//obligtoir si ana reload
        ).OBSERVER_PUT());
      }
    });
  }
  closeTicket(id: string) {
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to Close this ticket ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { _id: id, technicienId: this.techId }
        this.backendService.put(`${environment.apiUrl}/ticket/closeTicket`, payload).subscribe(new Observer(
          this.router,// just un class dans angular
          null,//
          true,//relode
          true,//swwet alert
          this.sharedService,//obligtoir si ana reload
        ).OBSERVER_PUT());
      }
    });
  }
  goToChat(id: string) {
    this.router.navigate(['main/test/chat', id])
      .then(() => {
        this.modalService.dismissAll();
      })
  }
  openAddRapport(id) {
    const modalRef = this.modalService.open(RapportInterventionComponent);
    modalRef.componentInstance.mytitle = 'Add Rapport';
    modalRef.componentInstance.ticketId = id;
    modalRef.componentInstance.add = true;
  }
  openUpdateRapport(item) {
    const modalRef = this.modalService.open(RapportInterventionComponent);
    modalRef.componentInstance.mytitle = 'Update Rapport';
    modalRef.componentInstance.id_contract = item.contractId;
    modalRef.componentInstance.id_Client = item.clientId;
    modalRef.componentInstance.technician = this.technician;
    modalRef.componentInstance.add = false;
    modalRef.componentInstance.Obj = item;
  }
  openAddTickets() {
    const modalRef = this.modalService.open(AddUpdateTiketesCustomerComponent);
    modalRef.componentInstance.mytitle = 'New Ticket';
    modalRef.componentInstance.id_contract = this.id_contract;
    modalRef.componentInstance.id_Client = this.id_client;
    modalRef.componentInstance.add = true;
  }
  assignTech(item) {
    const modalRef = this.modalService.open(AddUpdateTiketesCustomerComponent);
    modalRef.componentInstance.mytitle = 'Assign Technician';
    modalRef.componentInstance.id_contract = item.contractId._id;
    modalRef.componentInstance.assign = true;
    modalRef.componentInstance.Obj = item;
  }
  openUpdate(item) {
    const modalRef = this.modalService.open(AddUpdateTiketesCustomerComponent);
    modalRef.componentInstance.mytitle = 'Update Ticket';
    modalRef.componentInstance.id_contract = item.contractId;
    modalRef.componentInstance.id_Client = item.clientId;
    modalRef.componentInstance.technician = this.technician;
    modalRef.componentInstance.add = false;
    modalRef.componentInstance.Obj = item;
  }
  openCancel(id) {
    const modalRef = this.modalService.open(RaisenCancelTiketesComponent);
    modalRef.componentInstance.title = 'Ticket Cancellation Request';
    modalRef.componentInstance.id_ticket = id;
  }

  openDetails(ticket: any, content: TemplateRef<any>) {
    this.selectedTicket = ticket;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
    this.ticketId = this.selectedTicket._id;
  }
  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value;
    this.page = 1;
  }
  downloadFile(fileUrl: string, fileTitle: string, fileName: string): void {
    const fileExtension = fileName.split('.').pop();
    const fullFileName = `${fileTitle}.${fileExtension}`;
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fullFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
  }
  downloadRapport(fileUrl: string, fileTitle: string): void {
    const fullFileName = `${fileTitle}`; // Ensure it's always a PDF

    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fullFileName; // Set the correct filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
  }
  FindTypefile(fileName: string): string {
    const index = fileName.lastIndexOf(".");
    if (index !== -1) {
      return fileName.substring(index + 1).toUpperCase();
    }
    return '';
  }
  // deleteFile(id) {
  //   console.log(this.selectedTicket)
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: "You want to delete this file?",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Confirmer',
  //     cancelButtonText: 'Annuler',
  //     allowOutsideClick: true,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const obj = { _id: id };
  //       const aoiurl = environment.apiUrl + '/files/deleteFile';
  //       this.backendService.post(aoiurl, obj).subscribe(
  //         (res: any) => {
  //           this.allFiltredTickets[this.selectedTicketIndex].listOfFiles =
  //             this.allFiltredTickets[this.selectedTicketIndex].listOfFiles.filter(x => x._id !== res.rows._id);
  //           Swal.fire({
  //             title: 'Deleted!',
  //             text: 'The file has been deleted successfully.',
  //             icon: 'success',
  //             confirmButtonText: 'OK',
  //           });
  //         }
  //       );
  //     }

  //   });
  // }

  deleteRapport(id) {
    console.log(this.selectedTicket)
    Swal.fire({
      title: 'Are you sure ?',
      text: " you want to delete this Rapport ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = { _id: id };
        const aoiurl = environment.apiUrl + '/ticket/deleteRapport';
        this.backendService.post(aoiurl, obj).subscribe(
          (res: any) => {
            this.allFiltredTickets[this.selectedTicketIndex].rapportId =
              this.allFiltredTickets[this.selectedTicketIndex].rapportId.filter(x => x._id !== res.rows._id);
            Swal.fire({
              title: 'Deleted!',
              text: 'The rapport has been deleted successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          }
        );
      }
    });
  }
}

