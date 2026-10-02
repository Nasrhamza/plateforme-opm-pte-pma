import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reclamation } from 'src/app/core/models/reclamation.model';
import { ReclamationService } from 'src/app/core/services/reclamation.service';
import { environment } from 'src/environments/environment.development';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-reclamation-details-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './reclamation-details-dialog.component.html',
  styleUrl: './reclamation-details-dialog.component.scss'
})
export class ReclamationDetailsDialogComponent implements OnInit {

  reclamation : Reclamation | null = null;
  imagesUrl = environment.userImagesUrl;
  
  constructor(
    private _reclamationService : ReclamationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReclamationDetailsDialogComponent>,
  ){
  }

  ngOnInit(): void {
    this._reclamationService.findById(this.data.id).subscribe(
      res=>{
        this.reclamation = res.data!
      }
    )
  }

}
