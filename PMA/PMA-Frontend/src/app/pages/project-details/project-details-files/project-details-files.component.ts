import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, map, switchMap } from 'rxjs';
import { ProjectFileCardComponent } from 'src/app/components/project-file-card/project-file-card.component';
import { ProjectFile } from 'src/app/core/models/project_file.model';
import { FilesService } from 'src/app/core/services/files.service';
import { UploadMultipleDocumentsDialogComponent } from 'src/app/shared/dialogs/upload-multiple-documents-dialog/upload-multiple-documents-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-project-details-files',
  standalone: true,
  imports: [
    ProjectFileCardComponent,
    SharedModule
  ],
  templateUrl: './project-details-files.component.html',
  styleUrl: './project-details-files.component.scss'
})
export class ProjectDetailsFilesComponent implements OnInit{

  projectFiles : { type : string, files : ProjectFile[] }[] = [];
  filteredProjectFiles : { type : string, files : ProjectFile[] }[] = [];
  selectedTab : string = "all";
  projectId : string | null = null;
  loading = false;

  constructor(
    private _route : ActivatedRoute,
    private  _fileServie : FilesService,
    public dialog: MatDialog,
  ){}


  openBar(){
    if(!this.projectId) return;
    const dialogRef = this.dialog.open(UploadMultipleDocumentsDialogComponent, { data : {  projectId : this.projectId } });
    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.data){
        if(result.action == 'add'){
          this.projectFiles = [...this.projectFiles, ...this.groupByType(result.data)];
          this.filteredProjectFiles = this.projectFiles;
        }
      }
    });
  }

  groupByType(files : any[]) : any[]{
    const groupedFiles = files.reduce((acc : any, file : any)=>{
        let typeGroup = acc.find((group:any) => group.type === file.type);
        
        if (!typeGroup) {
            typeGroup = { type: file.type, files: [] };
            acc.push(typeGroup);
        }
        typeGroup.files.push(file);
        return acc;
    }, [])
    return groupedFiles;
  }
  ngOnInit(): void {
    this.fetchFiles();
  }

  fetchFiles(){
    this.loading = true;
    this._route.parent!.paramMap.pipe(
      map(params => params.get('projectId')),
      switchMap(projectId => {
        this.projectId = projectId;
        if(!projectId) return EMPTY;
        return this._fileServie.findAll({ project : projectId })
      })
    ).subscribe(
      res=>{
        this.projectFiles = res;
        this.filteredProjectFiles = res;
        this.loading = false;
      }
    )
  }

  handleFilesFilter(type : string){
    this.selectedTab = type;
    if(this.selectedTab == "all"){
      this.filteredProjectFiles = this.projectFiles;
    }else{
      this.filteredProjectFiles = this.projectFiles.filter(f => f.type == this.selectedTab)
    }
  }

  handleCardEvent(event : { action : string, id : string, type : any }){
    let group = this.projectFiles.find(group => group.type === event.type);
    group!["files"] = group!["files"].filter(file => file._id !== event.id);
    if(group!["files"].length == 0){
      this.projectFiles = this.projectFiles.filter(g => g.type !== event.type);
      this.filteredProjectFiles = this.projectFiles;
    }
  }

}
