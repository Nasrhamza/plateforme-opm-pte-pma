import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-solution-requests',
  templateUrl: './solution-requests.component.html',
  styleUrls: ['./solution-requests.component.scss']
})
export class SolutionRequestsComponent implements OnInit {
  fileurl: string = environment.fileUrl;
  searchTerm: string = '';
  statusFilter: string = 'all';
  page: number = 1;
  requestsCount: number;
  listRequests: any[] = [];
  filteredRequests: any[] = [];

  constructor(
    private backendService: BackendService,
    public sharedService: SharedService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getAllRequests();
  }

  getAllRequests() {
    this.backendService.get(`${environment.apiUrl}/solution/getAllRequests`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listRequests = response.rows;
        this.requestsCount = this.listRequests.length;
        this.applyFilters();
      })
    );
  }

  applyFilters() {
    let filtered = [...this.listRequests];

    if (this.statusFilter === 'validated') {
      filtered = filtered.filter(req => req.valid === true);
    } else if (this.statusFilter === 'pending') {
      filtered = filtered.filter(req => !req.valid);
    }

    this.filteredRequests = filtered;
  }

  validateRequest(id: string) {
    this.backendService
      .post(`${environment.apiUrl}/solution/validateRequest`, { id })
      .subscribe(new Observer(
        this.router,
        null,
        true,
        true,
        this.sharedService,
      ).OBSERVER_POST());
  }
}
