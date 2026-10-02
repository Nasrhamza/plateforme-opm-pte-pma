import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Observer from 'src/app/services/observer';
import { SharedService } from 'src/app/services/shared.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-contract-list-cli',
  templateUrl: './contract-list-cli.component.html',
  styleUrls: ['./contract-list-cli.component.scss']
})
export class ContractListCliComponent implements OnInit {
  fileurl: string = environment.fileUrl
  id_user;
  role;
  showdetails;
  listContrct: any = []
  constructor(private backendService: BackendService, public sharedService: SharedService,  private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.id_user = this.authService.getAuthUser().user._id;
    this.role = this.authService.getAuthUser().user.authority;
    if (this.role == 'technician') {
      this.getListContractByTechnician()
    } else {
      this.getlistContractFoClient()
    }
    this.showDetails();

  }
  async getlistContractFoClient() {
    await this.backendService.get(`${environment.apiUrl}/client/getListContractByClient/${this.id_user}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listContrct = response.rows;
      })
    );
  }
  async showDetails() {
    if (this.role == 'technician') {
      this.showdetails = '/main/test/ticketsTech/list-tickets';
    } else {
      this.showdetails = '/main/clientMang/customer-tickets/tiketes-List';
    }
  }
  async getListContractByTechnician() {
    await this.backendService.get(`${environment.apiUrl}/client/getListContractByTechnician/${this.id_user}`).subscribe(
      new Observer().OBSERVER_GET((response) => {
        this.listContrct = response.rows;
      })
    );
  }

  calculatePeriods(startDate: string, endDate: string): { daysBetweenNowAndEnd: number, daysBetweenStartAndEnd: number } {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysBetweenNowAndEnd = this.getDaysDifference(now, end);
    const daysBetweenStartAndEnd = this.getDaysDifference(start, end);
    return {
      daysBetweenNowAndEnd,
      daysBetweenStartAndEnd
    };
  }
  getDaysDifference(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; 
    return Math.round(((date2.getTime() - date1.getTime()) / oneDay));
  }
  comperDateContract(startDate, endDate) {
    let res = ""
    const { daysBetweenNowAndEnd, daysBetweenStartAndEnd } = this.calculatePeriods(startDate, endDate);
    if (daysBetweenNowAndEnd > daysBetweenStartAndEnd / 2) {
      res = "1"
    }
    if (0 < daysBetweenNowAndEnd && (daysBetweenNowAndEnd < daysBetweenStartAndEnd / 2)) {
      res = "2"
    }
    if (daysBetweenNowAndEnd < 0) {
      res = "3"
    }
    return res;
  }

  getCardClass(item: any): string {
    const result = this.comperDateContract(item.startDate, item.endDate);
    switch (result) {
      case "1":
        return 'card-border-c-green';
      case "2":
        return 'card-border-c-yellow';
      case "3":
        return 'card-border-c-red';
      default:
        return 'card-border-c-blue'; // Classe par défaut
    }
  }
}


