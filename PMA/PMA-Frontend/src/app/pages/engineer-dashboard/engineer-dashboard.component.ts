import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EMPTY, map, switchMap, take, tap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { RadialBarChartComponent } from 'src/app/components/radial-bar-chart/radial-bar-chart.component';
import { Project } from 'src/app/core/models/project.model';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { UserService } from 'src/app/core/services/users.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-engineer-dashboard',
  standalone: true,
  imports: [
    SharedModule,
    RadialBarChartComponent,
    NgApexchartsModule,
    EmptyDataComponent
  ],
  templateUrl: './engineer-dashboard.component.html',
  styleUrl: './engineer-dashboard.component.scss'
})
export class EngineerDashboardComponent implements OnInit, AfterViewInit{

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _taskService : TasksService,
    private _authService : AuthService,
    private _projectService : ProjectService,
    private _UserService : UserService,
    private _router : Router,
  ){}

  tasksData : any;
  projects : Project[] = [];
  clients : User[] = [];
  projectSeries : number[] = [];
  projectLabels : string[] = [];
  assignedProjects = 0;
  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['title', 'priority','progress', 'status', 'dateDebut'];
  filteredProjects : Project[] = [];
  dataSource : MatTableDataSource<Project> = new MatTableDataSource<Project>();

  public radialbarChartOptions: any;

  
  ngOnInit(): void {
    this.fetchTasks()
    this.fetchProjects();
    this.fetchClients();
  }

  goToProject(id : string){
    this._authService.authenticatedUser$.pipe(
      tap(user =>{
        this._router.navigate(['projects', id, 'main', 'details'])
      })
    ).subscribe();
  }

  initChart(){
    this.radialbarChartOptions = {
      series: this.projectSeries,
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
      labels: this.projectLabels,
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  fetchTasks(){
    this._authService.authenticatedUser$.pipe(
      take(1),
      switchMap(user=>{
        if(!user) return EMPTY;
        return this._taskService.findTasksByEngineer(user.id)
      })
    ).subscribe(
      res=>{
        this.tasksData = res.data!
      }
    )
  }
  fetchProjects(){
    this._authService.authenticatedUser$.pipe(
      take(1),
      switchMap(user=>{
        if(!user) return EMPTY;
        return this._projectService.findAll({ equipe : user.id })
      })
    ).subscribe(
      res=>{
        this.projects = res.data!.projects
        this.assignedProjects = res.data!.total;
        this.projects = res.data!.projects!;
        this.filteredProjects = this.projects;
        this.projectSeries = this.projects.map(p => p.progress!)
        this.projectLabels = this.projects.map(p =>(p.Projectname))
        this.initChart();
        this.refreshMatTable(this.filteredProjects);
      }
    )
  }
  fetchClients(){
    this._authService.authenticatedUser$.pipe(
      take(1),
      switchMap(user => {
        if(!user) return EMPTY;
        return this._UserService.findMyClients(user.id)
      })
    ).subscribe(
      res=>{
        this.clients = res.data!
      }
    )
  }

  refreshMatTable(newData : Project[]){
    this.dataSource = new MatTableDataSource<Project>(newData);
    this.dataSource.paginator = this.paginator;
  }

  handleClientSelect(e : any){
    if(e.value.length == 0) {
      this.filteredProjects = this.projects;
    }else{
      this.filteredProjects = this.projects.filter(p => p.client._id === e.value);
    }
    this.refreshMatTable(this.filteredProjects);
  }

  goToDetails(id: string){
    this._authService.authenticatedUser$.pipe(
      map(user => user?.roles[0].toLowerCase()),
      tap(role => this._router.navigate([role,'projects', id]))
    ).subscribe()
  }

}
