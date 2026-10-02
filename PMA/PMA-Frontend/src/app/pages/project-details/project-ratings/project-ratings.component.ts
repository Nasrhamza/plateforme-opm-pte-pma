import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, map, switchMap } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectFile } from 'src/app/core/models/project_file.model';
import { FilesService } from 'src/app/core/services/files.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { InformationDialogComponent } from 'src/app/shared/dialogs/information-dialog/information-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-project-ratings',
  standalone: true,
  imports: [
    SharedModule,
    InformationDialogComponent
  ],
  templateUrl: './project-ratings.component.html',
  styleUrl: './project-ratings.component.scss'
})
export class ProjectRatingsComponent implements OnInit{

    constructor(
      private _projectService : ProjectService,
      private  _fileServie : FilesService,
      private  _route : ActivatedRoute,
      public dialog : MatDialog
    ){}  

    imagesUrl = environment.userImagesUrl;
    projectId : string;
    projectRating : any | null = null;
    files : string[] = [];
    project : Project;
    loading = false;


    ngOnInit(): void {
      this.fetchProjectRatings();
    }

    fetchProjectRatings(){
      this.loading = true;
      this._route.parent!.paramMap.pipe(
        map(params => params.get('projectId')),
        switchMap(projectId => {
          if(!projectId) return EMPTY;
          this.projectId = projectId;
          return this._projectService.getProjectRating(this.projectId)
        })
      ).subscribe(
        res=>{
          this.projectRating = res.data;
          this.fetchProject();
          this.fetchProjectFiles();
        }
      )
    }

    openInformation(info : string){
      this.dialog.open(InformationDialogComponent, { data : { title : info  } })
    }
    fetchProjectFiles(){
      if(!this.projectId) return;
      this._fileServie.findAll({ project : this.projectId }).subscribe(
        (res : { type : string, files : any[] }[])=>{
          this.files = res.map(x => x.type.toUpperCase());
          this.loading = false;
        }
      )
    }
    fetchProject(){
      if(!this.projectId) return;
      this._projectService.findById(this.projectId).subscribe(
        res=>{
          this.project = res.data!;
        }
      )
    }


    existInFiles(file : string){
      return this.files.includes(file.toUpperCase());
    }

}
