import { Component, OnInit } from "@angular/core";
import { BackendService } from "src/app/services/backend.service";
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip
} from "ng-apexcharts";
import { environment } from "src/environments/environment";

export type TechnicianChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

@Component({
  selector: "app-apex-technician-chart",
  template: `<apx-chart [series]="chartOptions.series" [chart]="chartOptions.chart" 
                        [xaxis]="chartOptions.xaxis" [yaxis]="chartOptions.yaxis" 
                        [stroke]="chartOptions.stroke" [tooltip]="chartOptions.tooltip"
                        [fill]="chartOptions.fill" [plotOptions]="chartOptions.plotOptions" 
                        [dataLabels]="chartOptions.dataLabels" [legend]="chartOptions.legend"> 
              </apx-chart>`,
})
export class ApexTechnicianChartComponent implements OnInit {
  public chartOptions: Partial<TechnicianChartOptions>;

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    this.fetchTechnicianChartData();
  }

  fetchTechnicianChartData() {
    this.backendService.get(`${environment.apiUrl}/ticket/getTechnicianTicketsChart`).subscribe(
      (response: any) => {
        console.log("Technician Chart API Response:", response); // Debugging
        if (!response.err) {
          this.initChart(response.data);
        }
      },
      (error) => {
        console.error("Error fetching technician chart data:", error);
      }
    );
  }


  initChart(data: any) {
    this.chartOptions = {
      series: data?.series || [], // Use API response series
      chart: {
        type: "bar",
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: data?.categories || [] // Correct API mapping
      },
      yaxis: {
        title: {
          text: "Assigned Tickets"
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " tickets";
          }
        }
      },
      legend: {
        position: "top"
      }
    };
  }

}
