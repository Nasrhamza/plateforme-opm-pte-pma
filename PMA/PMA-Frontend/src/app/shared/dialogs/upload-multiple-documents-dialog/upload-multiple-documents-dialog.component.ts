import { Component, EventEmitter, Inject, OnInit, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { ProjectService } from 'src/app/core/services/project.service';
import { FormControl, Validators } from '@angular/forms';
import { MessageService } from 'src/app/core/services/message.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-upload-multiple-documents-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './upload-multiple-documents-dialog.component.html',
  styleUrl: './upload-multiple-documents-dialog.component.scss'
})
export class UploadMultipleDocumentsDialogComponent implements OnInit{

  @Output() selectFiles = new EventEmitter<File[] | null>();
  
  files: { id : number, type : string, file : File }[] = [];
  type : FormControl;
  isLetter = false;
  filesIndex = 0;
  isDragging = false;
  currentRole = "";
  loading = false;

  types = [
    { "type": "kickoff", "name": "Kick off" },
    { "type": "HLD_LLD", "name": "LLD" },
    { "type": "HLD", "name": "HLD" },
    { "type": "access_document", "name": "Access document" },
    { "type": "other", "name": "Other files" },
    { "type": "build_book", "name": "Build book" },
    { "type": "lettre", "name": "Appreciation letter" }
  ]

  constructor(
    public dialogRef: MatDialogRef<UploadMultipleDocumentsDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _projectService : ProjectService,
    private _messageService : MessageService,
    private _authService : AuthService,
  ){
    this.isLetter = this.data.letter;
  }

  ngOnInit(): void {
    this._authService.authenticatedUser$.pipe(
      tap(user=>{
        if(user){
          this.currentRole = user.roles[0]
        }
      })
    ).subscribe();
    this.type = new FormControl('', Validators.required);
    if(this.currentRole == "Client"){
      this.type.patchValue("Appreciation letter");
      this.type.disable()
    }
  }

  handleTypeSelect(type : string){
    this.type.patchValue(type);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
  }

  addFiles(files: FileList): void {
    if(this.type.value == ""){
      this._messageService.showErrorMessage("Invalid/Missing file type, pleasee select the file(s) type first");
      return;
    }
    for (let i = 0; i < files.length; i++) {
      this.files.push({ id : this.filesIndex , type : this.type.value.toUpperCase(), file : files[i]});
      this.filesIndex++;
    }
    if(!this.data.letter){
      this.type.reset();
    }
  }

  deleteFile(fileId : number){
    this.files = this.files.filter(f => f.id !== fileId);
  }  

  onSubmit(){
    if(this.files.length==0) {
      this._messageService.showErrorMessage("Please select at least 1 file");
      return;
    }
    if(!this.data.projectId){
      return;
    }
    this.loading = true;
    this._projectService.uploadMutipleFiles(this.data.projectId, this.files).subscribe(
      res=>{
        this.files = [];
        this.type.reset();
        this.loading = false;
        this._messageService.showSuccessMessage(res.message);
        this.dialogRef.close({ action : 'add', data : res.data });
      }
    );
  }

  closeDialog(){
    this.dialogRef.close();
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }


}
