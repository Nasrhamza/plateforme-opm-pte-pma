import { Component, Inject, OnInit, Optional } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProjectService } from 'src/app/core/services/project.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';

@Component({
  selector: 'app-project-files-rating-config',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './project-files-rating-config.component.html',
  styleUrl: './project-files-rating-config.component.scss'
})
export class ProjectFilesRatingConfigComponent implements OnInit{

  constructor(
    private _projectService : ProjectService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProjectFilesRatingConfigComponent>,
    private _message : MessageService
  ){}

  requiredFiles : string[] = [];
  selectedTypes : string[] = [];
  loading = false;
  types = [
    "HLD",
    "LLD",
    "Access document",
    "Appreciation Letter",
    "Kick off",
    "Build book",
  ]

  ngOnInit(): void {
    this.fetchProjectRatingFiles();
  }

  fetchProjectRatingFiles(){
    this._projectService.findById(this.data.project._id).subscribe(
      res => {
        if(res.data && res.data.requiredRatingFiles){
          this.selectedTypes = res.data.requiredRatingFiles;
        }
      }
    )
  }

  handleSubmit(){
    this.loading = true;
    this._projectService.configureFilesRatingConfig(this.data.project._id, this.selectedTypes).subscribe(
      res => {
        this.loading = false;
        this._message.showSuccessMessage(res.message);
        this.dialogRef.close({ data : res.data })
      }
    );
  }

  isTypeSelected(type : string){
    return this.selectedTypes.includes(type);
  }

  handleTypeSelect(selected: string){
    if(this.selectedTypes.includes(selected)){
      this.selectedTypes = this.selectedTypes.filter(t => t !== selected);
    }else{
      this.selectedTypes.push(selected);
    }
  }
}
