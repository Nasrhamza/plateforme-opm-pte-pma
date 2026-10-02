import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EMPTY, switchMap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { PieChartComponent } from 'src/app/components/pie-chart/pie-chart.component';
import { Project } from 'src/app/core/models/project.model';
import { Reclamation } from 'src/app/core/models/reclamation.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    SharedModule,
    PieChartComponent,
    NgApexchartsModule,
    EmptyDataComponent
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit{

  
  constructor(
    private _project : ProjectService,
    private _auth : AuthService,
    private _reclamationService : ReclamationService,
  ){}

  projects : Project[] = [];
  series:number[] = []
  labels:string[] = []
  reclamationSeries:number[] = []
  reclamationLabels:string[] = []
  reclamations : Reclamation[] = [];
  public projectsChartOptions: any;
  public reclamationsChartOptions: any;
  
  ngOnInit(): void {
    this.fetchProjects();
    this.fetchReclamation()
  }

  fetchProjects(){
    this._auth.authenticatedUser$.pipe(
      switchMap(user=>{
        if(!user) return EMPTY;
        return this._project.findClientProjects(user.id) 
      })
    ).subscribe(
      res=>{
        this.projects = res.data!.projects;
        this.series = [res.data!.completed!,res.data!.pending!,res.data!.inProgress]
        this.labels = ['Completed', 'Pending', 'In Progress'];
        this.initProjectsChart()
      }
    )
  }

  initProjectsChart(){
    this.projectsChartOptions = {
      ...options,
      series : this.series,
      labels : this.labels
    }      
  }
  initReclamationsChart(){
    this.reclamationsChartOptions = {
      ...options,
      series : this.reclamationSeries,
      labels : this.reclamationLabels
    }      
  }

  fetchReclamation(){
    this._auth.authenticatedUser$.pipe(
      switchMap(user=>{
        if(!user) return EMPTY;
        return this._reclamationService.findClientReclamations(user.id) 
      })
    ).subscribe(
      res=>{
        this.reclamations = res.data?.reclamations!;
        this.reclamationLabels = ['Pending', 'Treated', 'In Treatement'];
        this.reclamationSeries = [res.data?.pending!, res.data?.treated!, res.data?.inTreatement!];
        this.initReclamationsChart()
      }
    )
  }
}


export const options = {
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
    enabled: false,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70px',
      },
    },
  },
  legend: {
    show: false,
    position: 'bottom',
    width: '50px',
  },
  colors: ['#FFAE1F', '#5D87FF', '#ECF2FF', '#49BEFF', '#E8F7FF'],
  tooltip: {
    fillSeriesColor: false,
  },
};