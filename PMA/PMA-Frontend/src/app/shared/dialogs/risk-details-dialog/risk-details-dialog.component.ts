import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { RisksService } from 'src/app/core/services/risks.service';
import { Risk } from 'src/app/core/models/risk.model';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-risk-details-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './risk-details-dialog.component.html',
  styleUrl: './risk-details-dialog.component.scss'
})
export class RiskDetailsDialogComponent implements OnInit{

  risk : Risk | null = null;
  imagesUrl = environment.userImagesUrl;
  
  constructor(
    private _riskService : RisksService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RiskDetailsDialogComponent>,
  ){
  }


  ngOnInit(): void {
    if(!this.data) return;
    this._riskService.findById(this.data.id).subscribe(
      res => {
        this.risk = res.data!;
      }
    )
  }
}
