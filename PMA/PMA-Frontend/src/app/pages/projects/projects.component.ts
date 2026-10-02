import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, debounceTime, EMPTY, map, switchMap, take, tap } from 'rxjs';
import { EmptyDataComponent } from 'src/app/components/empty-data/empty-data.component';
import { ProjectTimelineComponent } from 'src/app/components/project-timeline/project-timeline.component';
import { Project } from 'src/app/core/models/project.model';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { AddProjectDialogComponent } from 'src/app/shared/dialogs/add-project-dialog/add-project-dialog.component';
import { AddReclamationDialogComponent } from 'src/app/shared/dialogs/add-reclamation-dialog/add-reclamation-dialog.component';
import { ClientReviewProjectDialogComponent } from 'src/app/shared/dialogs/client-review-project-dialog/client-review-project-dialog.component';
import { EvaluateLeaderDialog2 } from 'src/app/shared/dialogs/evaluate-leader-dialog2/evaluate-leader-dialog2.component';
import { EvaluateTaskDialog2 } from 'src/app/shared/dialogs/evaluate-task-dialog2/evaluate-task-dialog2.component';
import { ProjectFilesRatingConfigComponent } from 'src/app/shared/dialogs/project-files-rating-config/project-files-rating-config.component';
import { UploadMultipleDocumentsDialogComponent } from 'src/app/shared/dialogs/upload-multiple-documents-dialog/upload-multiple-documents-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    SharedModule,
    EmptyDataComponent,
    ProjectTimelineComponent,
    ProjectFilesRatingConfigComponent
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(
    private _projectService : ProjectService,
    public dialog: MatDialog,
    public _message: MessageService,
    private _route : ActivatedRoute,
    private _auth : AuthService,
    private _router : Router,
  ){}

  imagesUrl = environment.userImagesUrl;
  displayedColumns: string[] = ['title', 'timeline','priority','progress', 'status', 'actions'];
  projects : Project[] = [];
  filteredProjects : Project[] = [];
  dataSource : MatTableDataSource<Project> = new MatTableDataSource<Project>();
  showEnableButton = false;
  showEditButton = false;
  currentRole = '';
  projectTypesPerUserDepartment = '';
  currentUserId = '';
  lastTenYears:any = [];
  clientInput:FormControl;
  projectInput:FormControl;
  leaderInput:FormControl;
  status = '';
  departmentFilter = "";
  loading = false;

  //reactive search 
  departmentSearchSubject = new BehaviorSubject<string |null>(null);
  clientSearchSubject = new BehaviorSubject<string |null>(null);
  projectTitleSearchSubject = new BehaviorSubject<string |null>(null);
  yearSearchSubject = new BehaviorSubject<string |null>(null);
  statusSearchSubject = new BehaviorSubject<string |null>(null);
  leaderSearchSubject = new BehaviorSubject<string |null>(null);

  departmentSearch$ = this.departmentSearchSubject.asObservable();
  clientSearch$ = this.clientSearchSubject.asObservable();
  projectSearch$ = this.projectTitleSearchSubject.asObservable();
  yearSearch$ = this.yearSearchSubject.asObservable();
  statusSearch$ = this.statusSearchSubject.asObservable();
  leaderSearch$ = this.leaderSearchSubject.asObservable();


  reactiveSearch(){
    combineLatest([this.departmentSearch$, this.clientSearch$, this.projectSearch$, this.yearSearch$, this.statusSearch$, this.leaderSearch$])
    .pipe(
      tap(([department, client, project, year, status, leader]) => {
        this.filteredProjects = this.projects.filter(proj => 
          (!department || proj.type === department) &&
          (!client || proj.client.fullName.toLocaleLowerCase().includes(client.toLocaleLowerCase())) &&
          (!project || proj.Projectname.includes(project.toLocaleLowerCase())) &&
          (!year || new Date(proj.dateDebut).getFullYear().toString() === year) &&
          (!status || proj.status === status) &&
          (!leader || proj.TeamLeader.fullName.toLocaleLowerCase().includes(leader.toLowerCase()))
        );
        this.refreshMatTable(this.filteredProjects);
      })
    ).subscribe()
  }

  projectTypes = [
    { role: 'developement', type : 'Development'},
    { role: 'Networking', type : 'Network Infrastructure'},
    { role: 'System', type : 'Systems and Network Infrastructure'},
    { role: 'Cyber Security', type : 'Cyber Security'},
  ];

  handleProjectDepartment(dep? : string){
    switch (dep) {
      case "development":
        return 'Development';
      case "Networking":
        return 'Network Infrastructure';
      case "System":
        return 'Systems and Network Infrastructure';
      case "Cyber Security":
        return 'Cyber Security';
      default:
        return '';
    }
  }

  ngOnInit(): void {
    this._auth.authenticatedUser$.pipe(
      tap(user => {
        this.projectTypesPerUserDepartment = this.handleProjectDepartment(user?.department);
      })
    ).subscribe();
    this.fetchProjects();
    this._route.paramMap.pipe(
      tap((params : any) => {
        this.status = params.params.status
      })
    ).subscribe()
    this.getLastTenYears()
    this.clientInput = new FormControl();
    this.projectInput = new FormControl();
    this.leaderInput = new FormControl();
    this.handleSearch();
    this.reactiveSearch();
  }

  goToGantt(id : string){
    this._router.navigate(['projects', id, 'gantt'])
  }

  isOverdue(p : Project){
    if(p.closedAt){
      return new Date(p.closedAt) > new Date(p.dateFin) 
    }
    return false;
  }

  handleSearch(){
    this.clientInput.valueChanges.pipe(
      debounceTime(500),
      tap(value => {
        this.clientSearchSubject.next(value);
      })
    ).subscribe()
    
    this.leaderInput.valueChanges.pipe(
      debounceTime(500),
      tap(value => {
        this.leaderSearchSubject.next(value);
      })
    ).subscribe()

    this.projectInput.valueChanges.pipe(
      debounceTime(500),
      tap(value => {
        this.projectTitleSearchSubject.next(value);
      })
    ).subscribe()
  }

  goToGanttChart(id : string){
    this._router.navigate(['admin', 'projects',id, 'gantt'])
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  addProject(action : 'Add' | 'update', obj : any){
    obj.action = action;
    const dialogRef = this.dialog.open(AddProjectDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.projects = [result.data, ...this.projects];
          this.filteredProjects = this.projects;
        }
        if(result.action == 'update'){
          const index = this.projects.findIndex(e => e._id === obj._id)
          this.projects[index] = result.data;
          this.filteredProjects = [...this.projects];
        }
        this.refreshMatTable(this.filteredProjects);
      }
    });
  }

  noteProject(obj : any){
    const dialogRef = this.dialog.open(ClientReviewProjectDialogComponent, { data : obj, width : '700px' });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'update'){
          const index = this.projects.findIndex(e => e._id === obj._id)
          this.projects[index] = result.data;
          this.filteredProjects = [...this.projects];
        }
        this.refreshMatTable(this.filteredProjects);
      }
    });
  }

  addreclamation(element:Project){
    let obj:any = {...element}
    obj.action = 'Add';
    obj.selectedProject = element._id;
      this.dialog.open(AddReclamationDialogComponent, { data : obj, width : '700px' });
  }

  canEvaluateTeamLeaderAsMember(project : Project){
    if(this.currentRole != 'Engineer') return false;
    if(!project.rating) return false;
    if(project.status != 'Completed') return false;
    if(project.progress != 100) return false;
    if(project.rating.memberToTeamLeaderRatings.map(item => item.member._id).includes(this.currentUserId)) return false;
    if(!project.rating.membersNotes.length) return false;
    return true
  }
  canEvaluateTeamLeaderAsAdmin(project : Project){
    if(project.status != 'Completed') return false;
    if(project.progress != 100) return false;
    if(this.currentRole != 'Admin') return false;
    if(!project.rating) return false;
    if(!project.rating.memberToTeamLeaderRatings) return false;
    if(!project.rating.membersNotes.length) return false;
    if(project.rating.managerToTeamLeaderRating != 0) return false;
    if(project.rating.memberToTeamLeaderRatings.length < project.equipe.length) return false;
    return true
  }


  getProjectEquipeLength(project : Project){
    return new Set([
      ...project.rating!.membersNotes.map(x => x.member._id),
      ...project.equipe.map(x => x._id)
    ]).size;
  }

  adminCanSee(){
    return this.currentRole == "Admin";
  }

  fetchProjects(projectsPerDep? : string){
    this.loading = true;
    this._route.queryParamMap.pipe(
      take(1),
      map(params=>params.get('isExecutor')),
      switchMap(isExecutor=>{
        return this._auth.authenticatedUser$.pipe(
          take(1),
          switchMap(user => {
            if(!user) return EMPTY;
            this.currentRole = user.roles[0];
            this.currentUserId = user.id;
            this.projectTypesPerUserDepartment = user.department;
            if(projectsPerDep) {
              return this._projectService.findAll({ department : projectsPerDep })
            }
            if(this.currentRole === 'Engineer'){
              this.showEditButton = false;
              return this._projectService.findAll({ equipe : user.id })
            }
            if(this.currentRole === 'Team Leader'){
              // if(isExecutor){
              //   return this._projectService.findAll({ TeamLeader : user.id, equipe : user.id  })
              // }
              return this._projectService.findAll({ TeamLeader : user.id  })
            }
            if(this.currentRole === 'Admin') {
              this.showEditButton = true;
              return this._projectService.findAll()
            }
            if(this.currentRole === 'Client') {
              return this._projectService.findAll({ client : user.id })
            }
            return EMPTY;
          })
        )
      })
    ).subscribe(
      res => {
        this.projects = res.data!.projects!;
        this.filteredProjects = this.projects;
        this.loading = false;
        this.refreshMatTable(this.filteredProjects);
        //to get the department from the url if exist and then filter projects
        this._route.queryParams.pipe(
          tap((params : any) => {
            if(params && params.department){
              this.departmentSearchSubject.next(params.department);
            }
          })
        ).subscribe()
      }
    )
  }

  configureRequiredFiles(project : Project){
    const dialogRef = this.dialog.open(ProjectFilesRatingConfigComponent, { data : { project, action : project.hasFilesRatingConfig ? 'Update' : 'Add' } });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result && result.data && result.data.projectId){
          const index = this.projects.findIndex(p => p._id === result.data.projectId);
          this.projects[index].hasFilesRatingConfig = result.data.hasFilesRatingConfig;
          this.projects[index].requiredRatingFiles = result.data.requiredFiles;
          this.refreshMatTable(this.filteredProjects);
        }
      }
    )
  }

  uploadFile(project : Project, letter? : boolean){
    const dialogRef = this.dialog.open(UploadMultipleDocumentsDialogComponent, { data : { project, letter } });
    if(letter){
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
          const index = this.projects.findIndex(p => p._id === project._id);
          this.projects[index].letterUploaded = true;
          this.refreshMatTable(this.filteredProjects);
      })
    }
  }
  
  managerEvaluateTeamLeader(projectId : string){
    const dialogRef = this.dialog.open(EvaluateTaskDialog2, { data : { projectId } });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
          const index = this.projects.findIndex(p => p._id === projectId);
          this.projects[index].rating!.managerToTeamLeaderRating = result.event.teamLeaderNote;
          this.refreshMatTable(this.filteredProjects);
      })
  }
  memberEvaluateTeamLeader(projectId : string){
    const dialogRef = this.dialog.open(EvaluateLeaderDialog2, { data : { projectId } });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
          const index = this.projects.findIndex(p => p._id === projectId);
          this.projects[index].rating?.memberToTeamLeaderRatings.push({ member : { _id : this.currentUserId } as User, note : result.event });
          this.refreshMatTable(this.filteredProjects)
      })
  }

  delete(id : string){
    // const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
    //   dialogRef.afterClosed().subscribe((result) => {
    //     //handle delete here
    //     if(!result || !result.event) return;
    //     if(result.event.answer == false) return;
    //     this._users.delete(result.event.data).subscribe(
    //       res => {
    //         this._message.showSuccessMessage(res.message);
    //         this.users = this.users.filter(c => c._id !== res.data!._id);
    //         this.filteredUsers = this.users;
    //         this.refreshMatTable(this.filteredUsers);
    //       }
    //     )
    //   })
  }

  getLastTenYears() {
    const currentYear = new Date().getFullYear();
    for (let i = 10; i > -1; i--) {
      this.lastTenYears.push(currentYear - i);
    }
    this.lastTenYears.sort((a:any, b:any) => b - a)
  }

  showDetails(id : any){
    this._router.navigate(['projects', id, 'main', 'details'])
  }

  refreshMatTable(newData : Project[]){
    this.dataSource = new MatTableDataSource<Project>(newData);
    this.dataSource.paginator = this.paginator;
  }

  handleYearSelect(e: any) {
    this.yearSearchSubject.next(e.value.toString());
    this.refreshMatTable(this.filteredProjects);
  }
  handleDepartmentSelect(e: MatSelectChange) {
    if(e.value == 'All my department projects'){
      this.fetchProjects(this.projectTypesPerUserDepartment);
    }else{
      this.departmentSearchSubject.next(e.value)
    }
  }

  handleProjectStatusFilter(e : any){
    this.statusSearchSubject.next(e.value)    
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
}
