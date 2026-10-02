import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { ProjectDetailsComponent } from '../project-details-details/project-details.component';
import { ProjectDetailsTasksComponent } from '../project-details-tasks/project-details-tasks.component';
import { ProjectService } from 'src/app/core/services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, switchMap, tap } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectDetailsRisksComponent } from '../project-details-risks/project-details-risks.component';
import { ProjectDetailsReclamationsComponent } from '../project-details-reclamations/project-details-reclamations.component';
import { ProjectDetailsFilesComponent } from '../project-details-files/project-details-files.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientReviewProjectDialogComponent } from 'src/app/shared/dialogs/client-review-project-dialog/client-review-project-dialog.component';
import { ProjectRatingsComponent } from '../project-ratings/project-ratings.component';
import { ProjectFilesRatingConfigComponent } from 'src/app/shared/dialogs/project-files-rating-config/project-files-rating-config.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ManagerEvaluateLeaderDialog } from 'src/app/shared/dialogs/manager-evaluate-leader-dialog/manager-evaluate-leader-dialog.component';
import { EvaluateLeaderDialog2 } from 'src/app/shared/dialogs/evaluate-leader-dialog2/evaluate-leader-dialog2.component';

@Component({
  selector: 'app-project-details-layout',
  standalone: true,
  imports: [
    SharedModule,
    ProjectDetailsComponent,
    ProjectDetailsTasksComponent,
    ProjectDetailsRisksComponent,
    ProjectDetailsReclamationsComponent,
    ProjectDetailsFilesComponent,
    ProjectRatingsComponent,
  ],
  templateUrl: './project-details-layout.component.html',
  styleUrl: './project-details-layout.component.scss'
})
export class ProjectDetailsLayoutComponent implements OnInit{

  project : Project;
  role = "";
  activeTabIndex = 0;
  userId : string;

  tabs : { label : string, icon : string, route : string }[] = [
    {
      label: 'Details',
      icon: 'info-circle',
      route: 'details'
    },
    {
      label: 'Tasks',
      icon: 'checklist',
      route: 'tasks'
    },
    {
      label: 'Risks',
      icon: 'alert-triangle',
      route: 'risks'
    },
    {
      label: 'Reclamations',
      icon: 'bell',
      route: 'reclamations'
    },
    {
      label: 'Files',
      icon: 'files',
      route: 'files'
    },
    // {
    //   label: 'Ratings',
    //   icon: 'star',
    //   route: 'ratings'
    // },
  ]

  constructor(
    private _projectService : ProjectService,
    private _authService : AuthService,
    private _route : ActivatedRoute,
    private _router : Router,
    private _dialog : MatDialog
  ){}

  ngOnInit(): void {
    this._authService.authenticatedUser$.pipe(
      tap(user => {
        if(user){
          this.role = user.roles[0];
          this.userId = user.id;
          if(this.role === 'Admin'){
            this.tabs.push({
              label: 'Ratings',
              icon: 'star',
              route: 'ratings'
            })
          }
        }
      })
    ).subscribe();
    this.fetchProject();
  }
  
  fetchProject(){
    this._route.paramMap.pipe(
      switchMap(params => {
        if(!params) return EMPTY;
        return this._projectService.findById(params.get('projectId')!)
      })
    ).subscribe(
      res => {
        this.project = res.data!;
        //ask for client not whenevr the project completed
        if(this.role == 'Client' && !this.project.note_Client && this.project.progress === 100 && this.project.status === 'Completed'){
          this._dialog.open(ClientReviewProjectDialogComponent, { data : this.project, minWidth : '600px', maxWidth : '700px' });
          return;
        }
        
        if(
          this.role == 'Admin' 
          // && this.project.rating?.memberToTeamLeaderRatings.length === this.project.equipe.length 
          && !this.project.hasFilesRatingConfig
        ){
          this._dialog.open(ProjectFilesRatingConfigComponent, { data : { project : this.project, action : this.project.hasFilesRatingConfig ? 'Update' : 'Add' }, minWidth : '600px', maxWidth : '700px' });
          return;
        }
        if(
          this.role == 'Engineer' 
          && this.project.progress === 100 
          && this.project.status === 'Completed'
          && this.project.rating?.memberToTeamLeaderRatings.map(x => x.member._id).includes(this.userId)
        ){
          this._dialog.open(EvaluateLeaderDialog2, { data : { projectId : this.project._id }, minWidth : '600px', maxWidth : '700px' });
        }
        if(
          this.role == 'Admin' 
          // && this.project.rating?.memberToTeamLeaderRatings.length === this.project.equipe.length 
          && this.project.progress === 100 
          && this.project.status === 'Completed'
          && !this.project.teamLeaderNote
          && this.checkIfAllMembersEvaluatedteamLeader()
        ){
          this._dialog.open(ManagerEvaluateLeaderDialog, { data : { projectId : this.project._id }, minWidth : '600px', maxWidth : '700px' });
        }
      }
    )
  }


  checkIfAllMembersEvaluatedteamLeader(){
    // const membersWhoHasTasks = this.project.rating?.membersNotes.map(x => x.member._id);
    // const teamLeaderId = this.project.TeamLeader._id;
    // if(membersWhoHasTasks?.includes(teamLeaderId)){
    //   return this.project.equipe.length - 1;
    // }
    // return this.project.equipe.length;
    return this.project.rating?.memberToTeamLeaderRatings.length === this.project.equipe.length;
  }

  handleTabSelect(event : MatTabChangeEvent){
    const activeLabel = event.tab.textLabel;
    const route = this.tabs.find(tab => tab.label === activeLabel)?.route;
    this._router.navigate([route], { relativeTo : this._route });
  }

  handleChildEvent(event : any){
    this.fetchProject();
  }

  onActivate(e : Component){
    if(e instanceof ProjectDetailsComponent){
      this.activeTabIndex = this.tabs.findIndex(tab => tab.label === 'Details');
    }
    if(e instanceof ProjectDetailsTasksComponent){
      this.activeTabIndex = this.tabs.findIndex(tab => tab.label === 'Tasks');
    }
    if(e instanceof ProjectDetailsRisksComponent){
      this.activeTabIndex = this.tabs.findIndex(tab => tab.label === 'Risks');
    }
    if(e instanceof ProjectDetailsReclamationsComponent){
      this.activeTabIndex = this.tabs.findIndex(tab => tab.label === 'Reclamations');
    }
    if(e instanceof ProjectDetailsFilesComponent){
      this.activeTabIndex = this.tabs.findIndex(tab => tab.label === 'Files');
    }
    if(e instanceof ProjectRatingsComponent){
      this.activeTabIndex = this.tabs.findIndex(tab => tab.label === 'Ratings');
    }
  }
}