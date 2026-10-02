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

export type ChartOptions = {
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
  selector: "app-apex-bar-chart",
  template: `<apx-chart [series]="chartOptions.series" [chart]="chartOptions.chart" [xaxis]="chartOptions.xaxis"[yaxis]="chartOptions.yaxis" [stroke]="chartOptions.stroke" [tooltip]="chartOptions.tooltip"
                [fill]="chartOptions.fill" [plotOptions]="chartOptions.plotOptions" [dataLabels]="chartOptions.dataLabels" [legend]="chartOptions.legend"> </apx-chart>`,
})

export class ApexBarChartComponent implements OnInit {
  public chartOptions: Partial<ChartOptions>;

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    this.fetchChartData();
  }

  fetchChartData() {
    this.backendService.get(`${environment.apiUrl}/ticket/getAllTicketsChart`).subscribe(
      (response: any) => {
        if (!response.err) {
          this.initChart(response?.data);
        }
      },
      (error) => {
        console.error("Error fetching chart data:", error);
      }
    );
  }

  initChart(data: any) {
    this.chartOptions = {
      series: data?.series, // API response already provides the series
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
        categories: data.categories // API response provides categories
      },
      yaxis: {
        title: {
          text: "Number of Tickets"
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
