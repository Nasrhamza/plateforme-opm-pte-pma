import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sample-page',
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export class SamplePageComponent implements OnInit {
  fileurl: string = environment.fileUrl
  public rateHorizontal = 16;
  allTickets: any = {};
  listClient: any = {};
  listEquipment: any = {};
  listContract: any = {};
  listTechs: any = {};
  listSupervisors: any = {};
  userId: string = '';
  user
  role: string = '';
  userAuthority: string = '';
  validTicketCount: number = 0;
  assignedTicketCount: number = 0;
  closedTicketCount: number = 0;
  validTicket: any = {};
  allTicketsCount: number = 0;
  allClientsCount: number = 0;
  allEquipmentCount: number = 0;
  allContractsCount: number = 0;
  ticketCount: number = 0;
  inProgressTicketCount: number = 0;
  onHoldTicketCount: number = 0;
  notAssignedTicketCount: number = 0;
  filterStartDate: string = '';
  filterEndDate: string = '';
  filterTechnician: string = '';
  searchQuery: string = '';
  filterStatus: string = '';
  filteredTickets: any[] = [];
  filteredTicketsAdmin;
  resolvedAverageHours;
  closedAverageHours;
  assignedAverageHours
  notAssignedPercent = 0;
  assignedPercent = 0;
  inProgressPercent = 0;
  onHoldPercent = 0;
  resolvedPercent = 0;
  closedPercent = 0;
  top3;
  top1;
  top2;
  onHold1: any;
  onHold2: any;
  onHold3: any
  filterSupervisor: string = '';
  searchTimeout: any;
  isLoadingTickets = false;


  currentPage = 1;
  pageSize = 10
  totalPages = 1;
  totalPagesArray: number[] = [];

  constructor(
    public sahredserv: SharedService,
    private backendService: BackendService,
    private authService: AuthService,
    public sharedService: SharedService,
    private router: Router,

  ) { }

  ngOnInit() {
    this.userId = this.authService.getAuthUser().user._id;
    this.user = this.authService.getAuthUser().user;
    this.userAuthority = this.user.authority;
    this.role = this.user.role;
    this.getAllTicketsDashboard();
    this.getListClient();
    this.getAllContracts();
    this.getListTech();
    this.getListSupervisor();
    this.getTicketSummary();
    this.get3TopTechnicians();
    this.get3TopOnHoldTechnicians();
  }

  reloadTickets() {
    this.getAllTicketsDashboard(1);
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.reloadTickets();
    }, 400);
  }



  clearFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterTechnician = '';
    this.filterSupervisor = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.reloadTickets();
  }

  getListClient() {
    this.backendService.get(`${environment.apiUrl}/client/getListClient`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listClient = response.rows;
        this.allClientsCount = this.listClient.length;
      })
    );
  }
  get3TopTechnicians() {
    this.backendService.get(`${environment.apiUrl}/solution/get3TopTechnicians`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.top1 = response.rows[0];
        this.top2 = response.rows[1];
        this.top3 = response.rows[2];

      })
    );
  }
  get3TopOnHoldTechnicians() {
    this.backendService.get(`${environment.apiUrl}/solution/get3TopOnHoldTechnicians`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.onHold1 = response.rows[0];
        this.onHold2 = response.rows[1];
        this.onHold3 = response.rows[2];

      })
    );
  }

  handleGoToTicket(ticket) {
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

  getAllContracts() {
    this.backendService.get(`${environment.apiUrl}/contract/getAllContracts`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        const allContracts = response.rows || [];
        const filteredContracts = this.userAuthority === 'technician'
          ? allContracts.filter(contract =>
            contract.equipeTechnique?.some(member => member.tech === this.userId) ||
            contract.responsableEquipeTechnique?.responsable === this.userId
          )
          : allContracts;
        this.listContract = filteredContracts;
        this.allContractsCount = filteredContracts.length;
      })
    );
  }

  getTicketSummary() {
    const payload = {
      userId: this.userId,
      userAuthority: this.userAuthority,
      role: this.role
    };

    this.backendService.post(`${environment.apiUrl}/ticket/getTicketSummary`, payload)
      .subscribe((res: any) => {
        const s = res.summary;
        this.allTicketsCount = s.total;
        this.notAssignedPercent = s.total ? (s.notAssigned / s.total) * 100 : 0;
        this.assignedPercent = s.total ? (s.assigned / s.total) * 100 : 0;
        this.inProgressPercent = s.total ? (s.inProgress / s.total) * 100 : 0;
        this.onHoldPercent = s.total ? (s.onHold / s.total) * 100 : 0;
        this.resolvedPercent = s.total ? (s.resolved / s.total) * 100 : 0;
        this.closedPercent = s.total ? (s.closed / s.total) * 100 : 0;
      });
  }

  getAllTicketsDashboard(page = 1) {
    this.isLoadingTickets = true;

    const payload = {
      userId: this.userId,
      userAuthority: this.userAuthority,
      role: this.role,
      page,
      limit: this.pageSize,
      searchQuery: this.searchQuery,
      filterStatus: this.filterStatus,
      filterTechnician: this.filterTechnician,
      filterSupervisor: this.filterSupervisor,
      filterStartDate: this.filterStartDate,
      filterEndDate: this.filterEndDate
    };

    this.backendService
      .post(`${environment.apiUrl}/ticket/getAllTicketsDashboard`, payload)
      .subscribe((res: any) => {
        this.filteredTicketsAdmin = res.rows;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.isLoadingTickets = false;
      }, () => {
        this.isLoadingTickets = false;
      });
  }

  // Called when user clicks a page number
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.getAllTicketsDashboard(page);
  }


  getListTech() {
    this.backendService.get(`${environment.apiUrl}/tech/getListTechnician`).subscribe(
      (response: any) => {
        this.listTechs = response.rows;
      });
  }
  getListSupervisor() {
    this.backendService.get(`${environment.apiUrl}/tech/getListSupervisor`).subscribe(
      (response: any) => {
        this.listSupervisors = response.rows;
      });
  }
}

