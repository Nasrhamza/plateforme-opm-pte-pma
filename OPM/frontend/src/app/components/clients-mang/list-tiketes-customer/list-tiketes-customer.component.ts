import { Component, OnInit, ViewEncapsulation, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AddUpdateTiketesCustomerComponent } from '../add-update-tiketes-customer/add-update-tiketes-customer.component';
import { RaisenCancelTiketesComponent } from '../raisen-cancel-tiketes/raisen-cancel-tiketes.component';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { FilePreviewComponent } from '../../file-preview/file-preview.component';

@Component({
  selector: 'app-list-tiketes-customer',
  templateUrl: './list-tiketes-customer.component.html',
  styleUrls: ['./list-tiketes-customer.component.scss'],

})
export class ListTiketesCustomerComponent implements OnInit {
  fileurl: string = environment.fileUrl
  public size = 'md-view';
  public showView1 = false;
  public allTickets: any[] = [];
  public allFiltredTickets: any[] = [];
  assignedCount
  inProgressCount
  resolvedCount
  notAssignedCount
  closedCount
  deletedCount
  selectedFilter
  public solvedTickets: any[] = [];
  public closedTickets: any[] = [];
  public listTechs: any[] = [];
  public selectedTicketIndex: number | null = null;
  term: string = '';
  user
  role
  lastScrollTop = 0; // to track last scroll position
  isHidden = false; // flag for visibility
  ticketId;
  id_contract;
  listTickets: any = []
  public rateMovie = 1;
  selectedTicket: any;
  contractFiles: any[] = [];
  listEquipment: any[] = [];
  contract: any = []
  ticketCount: number = 0;
  page = 1;
  pageSize = 5;
  pageSizes = [5, 10, 15];
  id_client;


  constructor(private route: ActivatedRoute, private authService: AuthService, private backendService: BackendService, public sharedService: SharedService, private modalService: NgbModal, private router: Router) { }


  ngOnInit(): void {
    this.user = this.authService.getAuthUser().user
    this.id_client = this.user._id
    this.role = this.authService.getAuthUser().user.role
    if (this.role === 'clientManager') {
      this.getListTicketsForClientManager()
    } else { this.getListTicketsForClient() }
    this.getContractFiles();
    this.route.queryParams.subscribe(params => {
      const ticketId = params['ticketId'];
      if (ticketId) {
        this.openTicketDetails(ticketId);
      }
    });
  }

  openTicketDetails(ticketId: string): void {
    if (this.allFiltredTickets.length === 0) {
      if (this.role === 'clientManager') {
        this.backendService.get(`${environment.apiUrl}/ticket/getAllTicketByClientManager/${this.id_client}`).subscribe(() => {
          this.tryOpenTicketDetails(ticketId);
        });
      } else this.backendService.get(`${environment.apiUrl}/ticket/getAllTicketByClient/${this.id_client}`).subscribe(() => {
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

  getContractFiles() {
    this.backendService.get(`${environment.apiUrl}/contract/getContractFilesByClient/${this.id_client}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.contractFiles = response.rows;
        console.log(response)
      })
    );
  }

  goToChat(id: string) {
    this.router.navigate(['main/test/chat', id])
      .then(() => {
        this.modalService.dismissAll(); // Close the modal after navigation
      })
  }

  async getListTicketsForClient() {
    await this.backendService.get(`${environment.apiUrl}/ticket/getAllTicketByClient/${this.id_client}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.allTickets = response.rows
        console.log(this.allTickets)
        this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status !== 'Deleted')
        this.assignedCount = this.allTickets.filter(ticket => ticket.status === 'Assigned').length
        this.inProgressCount = this.allTickets.filter(ticket => ticket.status === 'In Progress').length
        this.resolvedCount = this.allTickets.filter(ticket => ticket.status === 'Resolved').length
        this.notAssignedCount = this.allTickets.filter(ticket => ticket.status === 'Not Assigned').length
        this.closedCount = this.allTickets.filter(ticket => (ticket.status === 'Expired' || ticket.status === 'Closed')).length
        this.deletedCount = this.allTickets.filter(ticket => ticket.status === 'Deleted').length
      })
    );
  }
  async getListTicketsForClientManager() {
    await this.backendService.get(`${environment.apiUrl}/ticket/getAllTicketByClientManager/${this.id_client}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.allTickets = response.rows
        this.allFiltredTickets = this.allTickets.filter(ticket => ticket.status !== 'Deleted')
        this.assignedCount = this.allTickets.filter(ticket => ticket.status === 'Assigned').length
        this.inProgressCount = this.allTickets.filter(ticket => ticket.status === 'In Progress').length
        this.resolvedCount = this.allTickets.filter(ticket => ticket.status === 'Resolved').length
        this.notAssignedCount = this.allTickets.filter(ticket => ticket.status === 'Not Assigned').length
        this.closedCount = this.allTickets.filter(ticket => (ticket.status === 'Expired' || ticket.status === 'Closed')).length
        this.deletedCount = this.allTickets.filter(ticket => ticket.status === 'Deleted').length
      })
    );
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

  openAddTickets() {
    const modalRef = this.modalService.open(AddUpdateTiketesCustomerComponent);
    modalRef.componentInstance.mytitle = 'New Ticket';
    modalRef.componentInstance.contracts = this.contract;
    modalRef.componentInstance.id_client = this.id_client;
    modalRef.componentInstance.add = true;
  }
  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value;
    this.page = 1;
  }
  openUpdate(item) {
    const modalRef = this.modalService.open(AddUpdateTiketesCustomerComponent);
    modalRef.componentInstance.mytitle = 'Update Ticket';
    modalRef.componentInstance.contracts = this.contract;
    modalRef.componentInstance.id_client = this.id_client;
    modalRef.componentInstance.add = false;
    modalRef.componentInstance.Obj = item;
  }
  openCancel(id) {
    const modalRef = this.modalService.open(RaisenCancelTiketesComponent);
    modalRef.componentInstance.title = 'Ticket Cancellation Request';
    modalRef.componentInstance.id_ticket = id;
  }
  toggleDetails(ticket: any) {
    this.selectedTicket = ticket;
    this.showView1 = true;
  }

  closeDetails() {
    this.showView1 = false;
    this.selectedTicketIndex = null;
  }

  filterEquipements(equipements: any[]): any[] {
    return (equipements || []).filter(e => e !== undefined);
  }

  downloadFile(fileUrl: string, fileTitle: string, fileName: string): void {
    // Extract file extension from the fileName
    const fileExtension = fileName.split('.').pop(); // Get the file extension from fileName
    const fullFileName = `${fileTitle}.${fileExtension}`; // Combine title with extension

    fetch(fileUrl) // Removed { mode: 'no-cors' }
      .then(response => {
        // Check if the response is okay (status 200-299)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Convert the response to a Blob
      })
      .then(blob => {
        // Create a link element
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fullFileName; // Set the filename with correct format
        // Append link to the body
        document.body.appendChild(link);
        // Simulate click to trigger download
        link.click();
        // Cleanup: Remove link and revoke the object URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
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

}
