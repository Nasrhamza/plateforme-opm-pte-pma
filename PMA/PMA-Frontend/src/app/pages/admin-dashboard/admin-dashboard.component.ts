import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, map, tap } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService, ProjectsOverview } from 'src/app/core/services/project.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';
import { options } from '../client-dashboard/client-dashboard.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { UserService } from 'src/app/core/services/users.service';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import { MatDialog } from '@angular/material/dialog';
import { FilesService } from 'src/app/core/services/files.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    SharedModule,
    NgApexchartsModule,
    EmptyDataComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit{


  constructor(
    private _projectService : ProjectService,
    public router : Router,
    private _authService : AuthService,
    private _userService : UserService,
    private _reclamationService : ReclamationService,
    private dialog : MatDialog,
    private _files : FilesService,
  ){}

  projects : Project[] = []
  filteredProjects : Project[] = []
  imagesUrl = environment.userImagesUrl;
  totalProjects = 0;
  displayedColumns: string[] = ['title', 'members','progress', 'status'];
  dataSource : MatTableDataSource<Project> = new MatTableDataSource<Project>();
  

  clientInput:FormControl;
  projectInput:FormControl;
  lastTenYears:any = [];

  projectSeries:any = []
  projectLabels:any = [];
  projectsByDepartments : Record<string, number> = {};

  clients = 0;

  projectsOverview : ProjectsOverview;
  usersOverview : any;
  totalFiles = 0;

  letters = 0;
  
  teamLeaderParticipationsSeries:any = []
  teamLeaderParticipationsLabels:any = []
  leadersParticipations:any = []
  
  reclamationsOverviewSeries:any = []
  reclamationsOverviewLabels:any = []

  engineerParticipationsSeries:any = []
  engineerParticipationsLabels:any = []

  projectsChartOptions : any;
  teamLeadersParticiaptionsChartOptions : any;
  engineersParticiaptionsChartOptions : any;
  reclamationsOverviewChartOptions : any;
  projectYearsComparaisonChartOptions : any;

  ngOnInit(): void {
    this.fetchProjects();
    this.getLastTenYears();
    this.clientInput = new FormControl();
    this.projectInput = new FormControl();
    this.fetchProjectsOverview()
    this.handleSearch();
    this.fetchTeamLeadersParticipations();
    this.fetchEngineersParticipations();
    this.fetchReclamationsOverview();
    this.fetchUsersOverview();
    this.fetchFilesCount();
    this.fetchAppLetters();
    this.fetchProjectsForCurrentAndLastYear();
  }

  fetchProjectsForCurrentAndLastYear(){
    this._projectService.getCurrentAndLastYearprojects().subscribe(
      res=>{
        this.projectYearsComparaisonChartOptions = {
          series: [
            {
              name: `${new Date().getFullYear() - 1}`,
              data: res.data?.last
            },
            {
              name: `${new Date().getFullYear()}`,
              data: res.data?.current
            }
          ],
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
            categories: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"
            ]
          },
          yaxis: {
            title: {
              text: "$ (thousands)"
            }
          },
          fill: {
            opacity: 1
          },
          tooltip: {
            y: {
              formatter: function(val:any) {
                return val + " projects";
              }
            }
          }
        };
      }
    );
  }

  fetchFilesCount(){
    this._projectService.getTotalFiles().subscribe(res=>{
      this.totalFiles = res.fileCount
    })
  }

  goToProject(id : string){
    this._authService.authenticatedUser$.pipe(
      tap(user =>{
        this.router.navigate(['projects', id, 'main', 'details'])
      })
    ).subscribe();
  }

  handleDepartmentClick(department : string){
    this.router.navigate(['projects'], { queryParams: { department } })
  }

  openAppreciationLetterModal(){
    this.router.navigate(['admin','appreciation-letters'])
    // this.dialog.open(AppLettersDialogComponent, { width : "700px" })
  }

  fetchUsersOverview(){
    this._userService.fetchUsersOverview().subscribe(
      res =>{
        this.usersOverview = res.data!
      }
    )
  }

  getProjectsByDepartment(): Record<string, number> {
    return this.projects.reduce((acc, project) => {
      if (project.type) {
        acc[project.type] = (acc[project.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  fetchAppLetters(){
    this._files.findAll({ type : "Appreciation Letter" }).subscribe(
      res=>{
        this.letters = res[0].files.length;
      }
    )
  }

  fetchReclamationsOverview(){
    this._reclamationService.findOverview().subscribe(
      res=>{
        this.reclamationsOverviewSeries = [res.data!.treated, res.data!.pending, res.data!.inTreatement];
        this.reclamationsOverviewLabels = ["Treated", "Pending", "In Treatement"];
        this.reclamationsOverviewChartOptions = {
          ...options,
          colors : ["#24c651", "#ff9901","#5d87ff"],
          chart: {
            id: 'donut-chart',
            type: 'donut',
            height: 120,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            foreColor: '#adb0bb',
            toolbar: {
              show: true,
            },
          },
          series : this.reclamationsOverviewSeries,
          labels : this.reclamationsOverviewLabels
        }
      }
    )
  }

  initProjectsChart(){
    this.projectsChartOptions = {
      ...options,
      colors: ['#24c651','#5d87ff','#ff9901', '#fe4a23'],
      chart: {
        id: 'donut-chart',
        type: 'donut',
        height: 150,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: '#adb0bb',
        toolbar: {
          show: true,
        },
      },
      series : this.projectSeries,
      labels : this.projectLabels
    }
  }
  initTeamLeadersParticiaptionsChart(){
    this.teamLeadersParticiaptionsChartOptions = {
      series: [
        {
          name: "Servings",
          data: this.teamLeaderParticipationsSeries
        }
      ],
      annotations: {
        points: [
          {
            x: "Bananas",
            seriesIndex: 0,
            label: {
              borderColor: "#775DD0",
              offsetY: 0,
              style: {
                color: "#fff",
                background: "#775DD0"
              },
              text: "Bananas are good"
            }
          }
        ]
      },
      chart: {
        height: 250,
        type: "bar"
      },
      plotOptions: {
        bar: {
          columnWidth: "50%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2
      },

      grid: {
        row: {
          colors: ["#fff", "#f2f2f2"]
        }
      },
      xaxis: {
        labels: {
          rotate: -45
        },
        categories: this.teamLeaderParticipationsLabels,
        tickPlacement: "on"
      },
      yaxis: {
        title: {
          text: "Servings"
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100]
        }
      }
    };
  }
  initEngineerParticiaptionsChart(){
    this.engineersParticiaptionsChartOptions = {
        series: [{
        data: this.engineerParticipationsSeries
      }],
        chart: {
        type: 'bar',
        height: 450
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: this.engineerParticipationsLabels,
      }
      }
  }

  handleSearch(){
    this.projectInput.valueChanges.pipe(
      debounceTime(500),
      tap(value => {
        if(!value) {
          this.filteredProjects = this.projects;
        }else{
          this.filteredProjects = this.projects.filter(p => p.Projectname.toLowerCase().includes(value.toLowerCase()))          
        }
        this.refreshMatTable()
      })
    ).subscribe()    
  }

  

  fetchProjects(){
    this._projectService.findAll().subscribe(
      res =>{
        this.projects = res.data?.projects!;
        this.totalProjects = res.data!.total;

        this.projects = res.data!.projects!;
        this.filteredProjects = this.projects
        this.projectsByDepartments = this.getProjectsByDepartment();
        this.refreshMatTable();
      }
    )
  }

  getLastTenYears() {
    const currentYear = new Date().getFullYear();
    for (let i = 10; i > -1; i--) {
      this.lastTenYears.push(currentYear - i);
    }
    this.lastTenYears.sort((a:any, b:any) => b - a)
  }

  handleYearSelect(e: any) {
    if(e.value){
      this.filteredProjects = this.projects
      .filter((p : Project) => new Date(p.dateDebut).getFullYear() == e.value)
    }else{
      this.filteredProjects = this.projects;
    }
    this.refreshMatTable();
  }

  refreshMatTable(){
    this.filteredProjects = this.filteredProjects.slice(0, 15).sort((a: Project, b: Project) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
    this.dataSource = new MatTableDataSource<Project>(this.filteredProjects);
  }

  handleProjectStatusFilter(e : any){
    switch (e.value) {
      case 'Completed':
        this.filteredProjects = this.projects.filter(e => e.status === "Completed");
        break;
      case 'Pending':
        this.filteredProjects = this.projects.filter(e => e.status === "Pending");
        break;
      case 'In Progress':
        this.filteredProjects = this.projects.filter(e => e.status === "In Progress");
        break;
      case 'Overdue':
        this.filteredProjects = this.getOverdueProjects();
        break;    
      default:
        this.filteredProjects = this.projects;
        break;
    }
    this.refreshMatTable()
  }

  getOverdueProjects(){
    return this.projects.filter((project) => {
      if (project.closedAt) {
        const deadline = new Date(project.dateFin);
        const closingDate = new Date(project.closedAt);
        return closingDate > deadline;
      }
      return false;
    });
  }

  fetchProjectsOverview(){
    this._projectService.findProjectsOverview().subscribe(
      res=>{
        this.projectsOverview = res.data!;
        this.projectSeries = [res.data!.completed.total, res.data!.inProgress.total, res.data!.pending.total, res.data!.overdue.total]
        this.projectLabels = ['Completed', 'In progress', 'Pending', 'Overdue'];
        this.initProjectsChart()
      }
    )
  }

  goToDetails(id: string){
    this._authService.authenticatedUser$.pipe(
      map(user => user?.roles[0].toLowerCase()),
      tap(role => this.router.navigate([role,'projects', id]))
    ).subscribe()
  }

  fetchTeamLeadersParticipations(){
    this._projectService.findTeamLeadersParticipations().subscribe(
      res=>{
        this.teamLeaderParticipationsSeries = res.data!.map(e => e.participations);
        this.teamLeaderParticipationsLabels = res.data!.map(e => e.leader.fullName);
        this.leadersParticipations = res.data;
        this.initTeamLeadersParticiaptionsChart()
      }
    )
  }
  
  fetchEngineersParticipations(){
    this._projectService.findEngineerParticipations().subscribe(
      res=>{
        this.engineerParticipationsSeries = res.data!.map(e => e.participations);
        this.engineerParticipationsLabels = res.data!.map(e => e.engineer.fullName);
        this.initEngineerParticiaptionsChart()
      }
    )
  }
}
