import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [
    SharedModule,
    NgApexchartsModule,
  ],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements OnInit, OnChanges{

  @Input() series : number[] = []
  @Input() labels : string[] = []
  @Input() title : string = ''


  public pieChartOptions: any;

  ngOnChanges(changes: any): void {
    this.ngOnInit()
  }
  ngOnInit(): void {
    this.pieChartOptions = {
      labels : this.labels,
      series: this.series,
      chart: {
        id: 'donut-chart',
        type: 'donut',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        toolbar: {
          show: true,
        },
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70px',
          },
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        width: '50px',
      },
      colors: ['#FFAE1F', '#5D87FF', '#ECF2FF', '#49BEFF', '#E8F7FF'],
      tooltip: {
        fillSeriesColor: false,
      },
    };
  }
  

}
