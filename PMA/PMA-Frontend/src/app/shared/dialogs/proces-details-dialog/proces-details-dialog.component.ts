import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { environment } from 'src/environments/environment.development';
import { ProcesV } from 'src/app/core/models/proces.model';
import { ProcesService } from 'src/app/core/services/proces.service';

@Component({
  selector: 'app-proces-details-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './proces-details-dialog.component.html',
  styleUrl: './proces-details-dialog.component.scss'
})
export class ProcesDetailsDialogComponent implements OnInit{

  proces : ProcesV | null = null;
  imagesUrl = environment.userImagesUrl;
  
  constructor(
    private _procesService : ProcesService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProcesDetailsDialogComponent>,
  ){
  }


  ngOnInit(): void {
    if(!this.data) return;
    this._procesService.findById(this.data.id).subscribe(
      res => {
        this.proces = res.data!;
      }
    )
  }
}
