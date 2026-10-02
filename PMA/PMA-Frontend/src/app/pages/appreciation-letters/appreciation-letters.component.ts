import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { debounceTime, map, tap } from 'rxjs';
import { ProjectFileCardComponent } from 'src/app/components/project-file-card/project-file-card.component';
import { Project } from 'src/app/core/models/project.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { FilesService } from 'src/app/core/services/files.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ShareFileDialogComponent } from 'src/app/shared/dialogs/share-file-dialog/share-file-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentPreviewDialog } from 'src/app/shared/dialogs/document-preview-dialog/document-preview-dialog.component';

@Component({
  selector: 'app-appreciation-letters',
  standalone: true,
  imports: [
    SharedModule,
    ProjectFileCardComponent,
  ],
  templateUrl: './appreciation-letters.component.html',
  styleUrl: './appreciation-letters.component.scss'
})
export class AppreciationLettersComponent implements OnInit{
 
  constructor(
    private _files : FilesService,
    private _auth : AuthService,
    private _projectService : ProjectService,
    public dialog: MatDialog,
    private _fileService : FilesService,
    private _messageService : MessageService,
    public router : Router,
    private sanitizer: DomSanitizer
  ){}

  role = "";
  imagesUrl : string = environment.userImagesUrl;
  filesUrl : string = `${environment.apiUrl}/projectsFile`;
  letters : { file : string, project : Project, type : string, _id : string, safeUrl : SafeResourceUrl  }[] = [];
  filteredLetters : { file : string, project : Project, type : string, _id : string, safeUrl : SafeResourceUrl  }[] = [];
  searchField : FormControl;

  ngOnInit(): void {
    this.searchField = new FormControl('');
    this.searchField.valueChanges.pipe(
      debounceTime(300),
      map((value : string) => value.toLowerCase()),
      tap(value=>{
        console.log(value)
        if(value.length > 0){
          this.filteredLetters = this.letters
          .filter(f => f.project.Projectname.toLowerCase().includes(value) || f.file.toLowerCase().includes(value)|| f.project.client.fullName.toLowerCase().includes(value))
        }else{
          this.filteredLetters = this.letters;
        }
      })

    ).subscribe();
    this._auth.authenticatedUser$.pipe(
      tap(user => {
        if(user){
          this.role = user.roles[0]
        }
      })
    ).
    subscribe();
    this._files.findAll({ type: 'Appreciation Letter' }).subscribe(
      res=>{
        if(res.length > 0){
          this.letters = res[0].files.map((file : any) => ({
            ...file,
            safeUrl: this.getSafeUrl(`${this.filesUrl}/${file.file}`)
          }));
          this.filteredLetters = this.letters
        }
      }
    )
  }
  
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  download(file : string){
    this._projectService.downloadFile(file)
  }

  shareFile(file? : string, projectName? : string) {
    this.dialog.open(ShareFileDialogComponent, { data : { file : file, projectName } });
  }

  openView(file : string){
    //  this.dialog.open(AppLettersDialogComponent, { data : { file }, width : "800px" })
  }
  delete(_id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : '' });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._fileService.delete(_id).subscribe(
          res=>{
            this._messageService.showSuccessMessage(res.message);
            this.letters = this.letters.filter(l => l._id !== res.data?._id);
            this.filteredLetters = this.letters;
          }
        )        
      })    
  }
  goToProject(projectId? : string){
    if(projectId){
      this.router.navigate(['admin', 'projects', projectId]);
    }
  }

  openPreview(file : any){
    this.dialog.open(DocumentPreviewDialog, { data : { file } })
  }
}
