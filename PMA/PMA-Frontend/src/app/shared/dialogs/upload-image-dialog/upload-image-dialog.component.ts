import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
// import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { EMPTY, switchMap, take } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthResponse } from 'src/app/core/models/auth-response.model';
import { UserService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-upload-image-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './upload-image-dialog.component.html',
  styleUrl: './upload-image-dialog.component.scss'
})
export class UploadImageDialogComponent {
  
  constructor(
    private _user : UserService,
    private _auth : AuthService,
    public dialogRef: MatDialogRef<UploadImageDialogComponent>,
  ){}

  selectedImagePreview : any = null;
  selectedImage : any | null = null; 

  selectFile(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      //support only images
      return;
    }
    //preview image
    this.selectedImage = input.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      this.selectedImagePreview = reader.result;
    };
  }

  handleUpload(){
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user => {
        if(!user) return EMPTY;
        return this._user.updateImage(user.id, this.selectedImage);
      })
    ).subscribe(
      res => {
        let authUserOld =  this._auth.getAuthUser() as AuthResponse;
        this._auth.setAuthUser({ ...authUserOld, image : res.data! });
        this._auth.saveAuthToLS({ ...authUserOld, image : res.data! });
        this.dialogRef.close({ data : res.data });
      }
    )
   }

}
