import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import { UserService } from 'src/app/core/services/users.service';
import { UpdateUserDetailsDialogComponent } from 'src/app/shared/dialogs/update-user-details-dialog/update-user-details-dialog.component';
import { UploadImageDialogComponent } from 'src/app/shared/dialogs/upload-image-dialog/upload-image-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-account-settings-profile',
  standalone: true,
  imports: [
    SharedModule
    
  ],
  templateUrl: './account-settings-profile.component.html',
  styleUrl: './account-settings-profile.component.scss'
})
export class AccountSettingsProfileComponent implements OnInit {
  
  constructor(
    public dialog: MatDialog,
    public _message: MessageService,
    public _auth: AuthService,
    public _user: UserService,
  ){}

  currentUserImage : string | null = null;
  imagesUrl = environment.userImagesUrl;
  currentUser : any | null = null;

  ngOnInit(): void {
    this.initUser();
  }

  initUser(){
    this._auth.authenticatedUser$.pipe(
      tap(
        user => {
          if(user){
            this.currentUserImage = user.image;
            this.currentUser = user;
          }
        }
      ),
      switchMap(user => !user ? EMPTY : this._user.findById(user?.id!))
    ).subscribe(
      res => {
        this.currentUser = res.data;
      }
    )
  }

  openEditProfile(){
    const dialogRef = this.dialog.open(UpdateUserDetailsDialogComponent, {});

    dialogRef.afterClosed().subscribe((result) => {
      if(!result || !result.event) return;
      this.currentUser = result.event
    })
  }

  changeImage(){
    const dialogRef = this.dialog.open(UploadImageDialogComponent, {});
    dialogRef.afterClosed().subscribe((result) => {
      if(!result || !result.data) return;
      this.currentUserImage = result.data
    })            
  }
}
