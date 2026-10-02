import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EMPTY, map, switchMap, tap } from 'rxjs';
import { ProjectFileCardComponent } from 'src/app/components/project-file-card/project-file-card.component';
import { Project } from 'src/app/core/models/project.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { AddProjectDialogComponent } from 'src/app/shared/dialogs/add-project-dialog/add-project-dialog.component';
import { ClientReviewProjectDialogComponent } from 'src/app/shared/dialogs/client-review-project-dialog/client-review-project-dialog.component';
import { EvaluateLeaderDialog2 } from 'src/app/shared/dialogs/evaluate-leader-dialog2/evaluate-leader-dialog2.component';
import { ManagerEvaluateLeaderDialog } from 'src/app/shared/dialogs/manager-evaluate-leader-dialog/manager-evaluate-leader-dialog.component';
import { ProjectFilesRatingConfigComponent } from 'src/app/shared/dialogs/project-files-rating-config/project-files-rating-config.component';
import { UploadDocumentDialogComponent } from 'src/app/shared/dialogs/upload-document-dialog/upload-document-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    SharedModule,
    ProjectFileCardComponent,
    NgApexchartsModule 
  ],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent implements OnInit{

  project : Project | null = null;

  imagesUrl = environment.userImagesUrl;

  constructor(
    private _router : Router, 
    private _route : ActivatedRoute, 
    private _auth : AuthService, 
    private _project : ProjectService,
    private dialog : MatDialog,
  ){}
  
  role = '';
  currentUserID:string;
  projectId : string | null = null;
  loading = false;
  progressChartOptions : any;
  
  ngOnInit(): void {
    this._auth.authenticatedUser$.pipe(
      tap(user=>{
        if(user) {
          this.role = user.roles[0];
          this.currentUserID = user.id;
        };
      })
    ).subscribe();
    this.fetchProject()
  }

  fetchProject(){
    this.loading = true;
    this._route.parent!.paramMap.pipe(
      map(params => params.get('projectId')),
      switchMap(projectId => {
        if(!projectId) return EMPTY;
        return this._project.findById(projectId)
      })
    ).subscribe(
      res=>{
        this.project = res.data!;
        this.loading = false;
        this.initChart();
        }
    );
  }

  evaluateTeamLeaderAsManager(){
    this.dialog.open(ManagerEvaluateLeaderDialog, { data : { projectId : this.project!._id } });
  }
  evaluateTeamLeaderAsMember(){
    this.dialog.open(EvaluateLeaderDialog2, { data : { projectId : this.project!._id } });
  }

  overdueStyle() {
    if(this.project && this.project.closedAt && new Date(this.project.closedAt) > new Date(this.project.dateFin)) return true
    return false
  }
  goToGantt(){
    if(this.role == "Admin"){
      this._router.navigate(['projects', this.project!._id, 'gantt'])
    }
    if(this.role == "Team Leader"){
      this._router.navigate(['projects', this.project!._id, 'gantt'])
    }
  }

  updateProject(){
    let obj : any = {...this.project};
    obj.action = 'update';
    const dialogRef = this.dialog.open(AddProjectDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'update'){
          this.project = result.data;
        }
      }
    });
  }

  initChart(){
    this.progressChartOptions = {
      series: [this.project?.progress],
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
      colors: this.project?.status === 'Completed' ? ['#13DEB9'] : this.project?.status === 'In Progress' ? ['#FFAE1F'] : ['#13DEB9'],
      labels: ['progress'],
    };
  }

  noteProject(){
    const dialogRef = this.dialog.open(ClientReviewProjectDialogComponent, { data : this.project, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'update'){
          this.project = result.data;
        }
      }
    });
  }

  uploadFile(letter? : boolean){
    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, { data : { id : this.project!._id, letter } });
    dialogRef.afterClosed().subscribe(res =>{
      if(res && res.event && res.event.fileType){
        this.project = {
          ...this.project!,
          [res.event.fileType] : res.event.file
        }
      }
    })
  }

  configureRequiredFiles(){
    if(!this.project) return;
      const dialogRef = this.dialog.open(ProjectFilesRatingConfigComponent, { data : { project : this.project, action : this.project.hasFilesRatingConfig ? 'Update' : 'Add' } });
      dialogRef.afterClosed().subscribe(
        result => {
          if(result && result.data && result.data.projectId){
            this.project!.hasFilesRatingConfig = result.data.hasFilesRatingConfig;
            this.project!.requiredRatingFiles = result.data.requiredFiles;
          }
        }
      )
    }
}
