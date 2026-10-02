import { Component, OnInit, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-satisfaction-chart',
  template: `<div id="ticket-status-chart" style="height: 200px"></div>`,
})
export class SatisfactionChartComponent implements OnInit, AfterViewInit, OnDestroy {
  private chart: am4charts.PieChart;
  userId: string;
  userAuthority: string;
  role: string;
  filteredTickets: any[] = [];

  constructor(
    private zone: NgZone,
    private backendService: BackendService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userId = this.authService.getAuthUser().user._id;
    this.userAuthority = this.authService.getAuthUser().user.authority;
    this.role = this.authService.getAuthUser().user.role;
    this.fetchTickets();
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.chart = am4core.create('ticket-status-chart', am4charts.PieChart);
      this.chart.innerRadius = 40;
      this.chart.logo.disabled = true;


      const pieSeries = this.chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = 'size';
      pieSeries.dataFields.category = 'status';
      pieSeries.labels.template.disabled = true;
      pieSeries.ticks.template.disabled = true;

      // ✅ Fix: Ensure slices get custom colors from the data
      pieSeries.slices.template.propertyFields.fill = "color";
      pieSeries.slices.template.propertyFields.stroke = "color"; // Optional: Match stroke to fill for better visuals
    });

    // Update chart data once initialized
    this.updateChartData();
  }


  fetchTickets() {
    const user = {
      userId: this.userId,
      userAuthority: this.userAuthority,
      role: this.role,
    };

    this.backendService.post(`${environment.apiUrl}/ticket/getAllTicketsDashboard`, user).subscribe(
      (response: any) => {
        if (!response.err) {
          this.filteredTickets = response.rows;
          this.updateChartData();
        }
      },
      (error) => {
        console.error('Error fetching tickets:', error);
      }
    );
  }

  updateChartData() {
    if (!this.chart) return;

    const total = this.filteredTickets.length || 1; // Avoid division by zero
    let notAssigned = 0,
      assigned = 0,
      inProgress = 0,
      resolved = 0,
      closed = 0;

    this.filteredTickets.forEach(ticket => {
      switch (ticket.status) {
        case 'Not Assigned':
          notAssigned++;
          break;
        case 'Assigned':
          assigned++;
          break;
        case 'In Progress':
          inProgress++;
          break;
        case 'Resolved':
          resolved++;
          break;
        case 'Closed':
          closed++;
          break;
      }
    });

    this.chart.data = [
      { status: "Not Assigned", size: notAssigned, color: am4core.color("#ffc107") }, // Yellow
      { status: "Assigned", size: assigned, color: am4core.color("#007bff") }, // Blue
      { status: "In Progress", size: inProgress, color: am4core.color("#fd7e14") }, // Orange
      { status: "Resolved", size: resolved, color: am4core.color("#28a745") }, // Green
      { status: "Closed", size: closed, color: am4core.color("#6c757d") }, // Gray
    ];
  }


  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
