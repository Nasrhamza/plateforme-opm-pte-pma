import { Component, EventEmitter, Input, OnInit, Output, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProjectFile } from 'src/app/core/models/project_file.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { FilesService } from 'src/app/core/services/files.service';
import { MessageService } from 'src/app/core/services/message.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { DocumentPreviewDialog } from 'src/app/shared/dialogs/document-preview-dialog/document-preview-dialog.component';
import { ShareFileDialogComponent } from 'src/app/shared/dialogs/share-file-dialog/share-file-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-project-file-card',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './project-file-card.component.html',
  styleUrl: './project-file-card.component.scss'
})
export class ProjectFileCardComponent implements OnInit{

  constructor(
    public dialog: MatDialog,
    private _projectService : ProjectService,
    private _messageService : MessageService,
    private _authService : AuthService,
    public _fileService : FilesService,
    private sanitizer: DomSanitizer
  ){}

  @Input() file : ProjectFile;
  @Input() class : string = "";
  filesUrl : string = `${environment.apiUrl}/projectsFile`;

  @Output() event = new EventEmitter();
  role = ""

  ngOnInit(): void {
    this._authService.authenticatedUser$.pipe().subscribe(
      user=>{
        if(user){
          this.role = user.roles[0]
        }
      }
    )
  }

  shareFile() {
    this.dialog.open(ShareFileDialogComponent, { data : { file : this.file.file, projectName : this.file.project._id } });
  }

  download(){
    this._projectService.downloadFile(this.file.file)
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  delete(){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : '' });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._fileService.delete(this.file._id).subscribe(
          res=>{
            this._messageService.showSuccessMessage(res.message);
            this.event.emit({ action : 'delete', id : this.file._id, type : this.file.type })
          }
        )        
      })    
  }

  isPdf() {
    return this.file.file.endsWith('.pdf') || this.file.file.endsWith('.PDF')
  }

  openPreview(){
    this.dialog.open(DocumentPreviewDialog, { data : { file : { safeUrl : this.getSafeUrl(`${this.filesUrl}/${this.file.file}`) } } })
  }
}
