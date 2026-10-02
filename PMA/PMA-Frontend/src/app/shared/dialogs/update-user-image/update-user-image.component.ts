import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/core/services/users.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-update-user-image',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './update-user-image.component.html',
  styleUrl: './update-user-image.component.scss'
})
export class UpdateUserImageComponent {

  constructor(
      private _user : UserService,
      public dialogRef: MatDialogRef<UpdateUserImageComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
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
      if(!this.data.userID) return;
      this._user.updateImage(this.data.userID, this.selectedImage).subscribe(
        res => {
          this.dialogRef.close({ data : res.data });
          console.log(res);
        }
      )
    }
  

}
