import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';
import { SharedModule } from '../../shared/shared.module';
import { environment } from 'src/environments/environment.development';
import { UserService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.scss'
})
export class AddUserDialogComponent {

  constructor(
    private _user : UserService,
    private _fb : FormBuilder,
    private _message : MessageService,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  form : FormGroup;
  selectedImagePreview : any;
  userImage : any;
  alignhide = true;
  updatePassword = false;

  ngOnInit(): void {

    this.form = this._fb.group({
      fullName : ['', Validators.required],
      email : ['', Validators.required],
      phone : ['', Validators.required],
      password : ['', this.data.action == 'Add' ?[Validators.required, Validators.minLength(6)] : null],
      confirmPassword : ['', this.data.action == 'Add' ? [Validators.required, Validators.minLength(6)] : null],
      roles : ['', [Validators.required, Validators.minLength(1)]],
      DateOfBirth : ['', Validators.required],
      hiringDate : ['', Validators.required],
      address : [''],
      company : [''],
    })
    if(this.data.action == 'update'){
      this.selectedImagePreview = `${environment.userImagesUrl}/${this.data.image}`;
      this.form.patchValue({ 
        fullName : this.data.fullName,
        email : this.data.email, 
        phone : this.data.phone, 
        roles : this.data.roles,
        DateOfBirth : this.data.DateOfBirth,
        hiringDate : this.data.hiringDate,
        address : this.data.address,
        company : this.data.company
      });
    }    
  }

  get f(){
    return this.form.controls;
  }


  submit(){
    if(!this.form.valid) {
      this._message.showErrorMessage('Please provide all fields');
      return;
    }
    const formData = new FormData;
    Object.keys(this.form.value).forEach(key => {
      formData.append(key, this.form.value[key]);
    });
    if(this.userImage){
      formData.append('image', this.userImage);
    }

    if(this.data.action === 'Add'){
      this._user.addUser(formData).subscribe(
        res => {
          this.dialogRef.close({ data : res.data, action :'add' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }else{
      const updates: any = { 
        fullName : this.form.value.fullName, 
        phone : this.form.value.phone,
        address : this.form.value.address,
        company : this.form.value.company,
        DateOfBirth : this.form.value.DateOfBirth
      };
      if(this.updatePassword) updates.password = this.form.value.password
      this._user.updateUser(this.data._id, updates).subscribe(
        res => {
          this.dialogRef.close({ data : res.data, action :'update' })
          this._message.showSuccessMessage(res.message);
        }
      )
    }
  }

  handlePasswordHide(e : any){
    this.alignhide = !this.alignhide;
    e.preventDefault();
  }

  selectFile(event: any): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      //support only images
      return;
    }
    this.userImage = input.files[0];
    //preview image
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      this.selectedImagePreview = reader.result;
    };
  } 
}
