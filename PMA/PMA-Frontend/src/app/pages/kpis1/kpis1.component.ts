import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatListModule } from "@angular/material/list";
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { KpiService } from 'src/app/core/services/kpi.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { tap } from 'rxjs';
import { ProjectsOverview, TasksOverview } from 'src/app/core/models/kpis.model';
@Component({
  selector: 'app-kpi1-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatOptionModule, 
    MatIconModule, 
    MatCardModule, 
    NgApexchartsModule, 
    MatExpansionModule, 
    MatListModule, 
    MatProgressSpinnerModule,
    SharedModule,
    EmptyDataComponent
  ],
  templateUrl: 'kpis1.component.html',
  styleUrls: ['kpis1.component.scss']
})


export class Kpis1Component implements OnInit {
  constructor(
    private _kpiService : KpiService,
    private _router : Router,
    private _authService : AuthService
  ) {
  }

  //================================
  projectsOverview : ProjectsOverview;
  tasksOverview : TasksOverview;
  barChartOptions : any;
  tasksPrioritiesChartOptions : any;
  tasksStatusChartOptions : any;
  tasksPrioritiesData : { keys : any, values: any };
  PrjectsPrioritiesChartOption: any;
  projectsByStatusData: { keys : any, values: any };
  tasksDistributionByStatus: { keys : any, values: any };
  projectNotes : any;
  projectFiles : any;
  //================================

  colors : string[] = [
              "#008FFB",
              "#00E396",
              "#FEB019",
              "#FF4560",
              "#775DD0",
              "#546E7A",
              "#26a69a",
              "#D10CE8"
        ];
        colors2 = [
          '#70382D',
          '#D17E75',
          '#CC9FA4',
          '#A7636C',
          '#F8EBEC',
        ];
        colors3 = ['#283044','#78A1BB', '#BFA89E', '#8B786D' ]
  ngOnInit(): void {    
    this.fethcKpis();
  }

  getBarChartOptions(series : any, labels : any, colors : any ){
    return {
      series: [
        {
          name: "distibuted",
          data: series
        }
      ],
      chart: {
        // height: 350,
        type: "bar",
        events: {
          click: function(chart:any, w:any, e:any) {
            // console.log(chart, w, e)
          }
        }
      },
      colors: this.colors2,
      plotOptions: {
        bar: {
          columnWidth: "45%",
          // distributed: true
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      grid: {
        show: false
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            colors: this.colors,
            fontSize: "12px"
          }
        }
      }
    };
  }


  splitRecord<K extends string, V>(record: Record<K, V>): { keys: K[]; values: V[] } {
    const keys = Object.keys(record) as K[];
    const values = Object.values(record) as V[];
    return { keys, values };
  }

  fethcKpis(){
    this._kpiService.getKpis().subscribe(
      res => {
        this.projectsOverview = res.data?.projectsOverview!;
        this.tasksOverview = res.data?.tasksOverview!;
        this.projectsByStatusData = this.splitRecord(this.projectsOverview.statusDist);      
        this.barChartOptions = this.getBarChartOptions(this.projectsByStatusData.values, this.projectsByStatusData.keys, this.colors);
        this.projectsByStatusData = this.splitRecord(this.projectsOverview.priorities);      
        this.PrjectsPrioritiesChartOption = this.getPolarChartOptions(this.projectsByStatusData.values, this.projectsByStatusData.keys);
        this.projectNotes = Object.entries(this.projectsOverview.notes).map(([key, value]) => ({ key, value }));
        this.projectFiles = Object.entries(this.projectsOverview.files).map(([key, value]) => ({ key, value }));
        this.tasksDistributionByStatus = this.splitRecord(this.tasksOverview.statusDist);
        this.tasksStatusChartOptions = this.getBarChartOptions(this.tasksDistributionByStatus.values, this.tasksDistributionByStatus.keys, []);
        this.tasksPrioritiesData = this.splitRecord(this.tasksOverview.priorities);
        this.tasksPrioritiesChartOptions = this.getPieChartOptions(this.tasksPrioritiesData.values, this.tasksPrioritiesData.keys, null)
      }
    );
  }

  getPolarChartOptions(series : any, labels : any, colors? : string[]){
    return {
      series: series,
      chart: {
        type: "polarArea"
      },
      labels : labels,
      stroke: {
        colors: ["#fff"]
      },
      colors : this.colors2,
      fill: {
        opacity: 0.8
      },
      responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: "bottom"
              }
            }
          }
        ]
      };
  }

  getPieChartOptions(series : any, labels : any, colors : any){
    return {
      series: series,
      chart: {
        type: "donut"
      },
      colors : this.colors2,
      labels: labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  goToProject(id : string){
      this._authService.authenticatedUser$.pipe(
        tap(user =>{
          this._router.navigate(['projects', id, 'main', 'details'])
        })
      ).subscribe();
    }
}

