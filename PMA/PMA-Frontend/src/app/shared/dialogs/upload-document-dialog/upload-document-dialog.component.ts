import { Component, EventEmitter, Inject, OnInit, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { ProjectService } from 'src/app/core/services/project.service';
import { FormControl, Validators } from '@angular/forms';
import { MessageService } from 'src/app/core/services/message.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload-document-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './upload-document-dialog.component.html',
  styleUrl: './upload-document-dialog.component.scss'
})
export class UploadDocumentDialogComponent implements OnInit{

  @Output() selectFiles = new EventEmitter<File[] | null>();


  selectedFile : File;
  type : FormControl;
  isLetter = false;
  types = [
    { "type": "kickoff", "name": "Kick off" },
    { "type": "HLD_LLD", "name": "LLD" },
    { "type": "HLD", "name": "HLD" },
    { "type": "access_document", "name": "Access document" },
    { "type": "other", "name": "Other" },
    { "type": "other1", "name": "Other1" },
    { "type": "other2", "name": "Other2" },
    { "type": "other3", "name": "Other3" },
    { "type": "build_book", "name": "Build book" },
    { "type": "lettre", "name": "Lettre" }
  ]

  constructor(
    public dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _projectService : ProjectService,
    private _messageService : MessageService,
    private _route : ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.type = new FormControl('', Validators.required);
    this.isLetter = this.data.letter
  }

  selectFile(event: any): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFile = target.files[0]
    }
  }

  onSubmit(){
    if(this.isLetter) this.type.patchValue('lettre');
    if(this.selectedFile && this.type.valid){
      this._projectService.uploadFile(this.data.id, this.type.value, this.selectedFile).subscribe(
        res=>{
          this._messageService.showSuccessMessage(res.message);
          this.dialogRef.close({ event : { file : res.data, fileType : this.type.value } })
        }
      )
    }
  }

}
