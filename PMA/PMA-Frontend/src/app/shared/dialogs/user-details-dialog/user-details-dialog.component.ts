import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/core/models/user.model';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './user-details-dialog.component.html',
  styleUrl: './user-details-dialog.component.scss'
})
export class UserDetailsDialogComponent implements OnInit{

  user : User | null = null;
  
  constructor(
    private _user : UserService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserDetailsDialogComponent>,
  ){
  }


  ngOnInit(): void {
    if(!this.data) return;
    this._user.findById(this.data.id).subscribe(
      res => {
        this.user = res.data!;
      }
    )
  }
}
