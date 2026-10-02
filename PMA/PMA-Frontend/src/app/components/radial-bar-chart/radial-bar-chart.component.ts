import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-radial-bar-chart',
  standalone: true,
  imports: [
    NgApexchartsModule,
    SharedModule
  ],
  templateUrl: './radial-bar-chart.component.html',
  styleUrl: './radial-bar-chart.component.scss'
})
export class RadialBarChartComponent implements OnInit, OnChanges{
  
  @ViewChild('chart') chart: ChartComponent;
  @Input() title = '';
  @Input() series:number[] = [];
  @Input() labels:string[] = [];

  public radialbarChartOptions: any;
  

  ngOnChanges(changes: any): void {
    this.ngOnInit()
  }
  
  ngOnInit(): void {
    this.radialbarChartOptions = {
      series: this.series,
      chart: {
        id: 'radial-chart',
        type: 'radialBar',
        height: 350,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
      },
      colors: ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F'],
      labels: this.labels,
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Average',
              formatter(w : any) {
                let sum = (w.globals.seriesTotals.reduce((a:any, b:any) => a + b, 0) / w.globals.series.length).toFixed() + "%";
                return sum.toString()
              },
            },
          },
        },
      },
      tooltip: {
        theme: 'dark',
      },
    };
  }

}