import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/core/services/core.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent implements OnInit{
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService, 
    public router: Router,
    private _fb : FormBuilder,
    private _authService : AuthService,
    private _messageService : MessageService,
  ) {}

  form : FormGroup;
  alignhide = true;
  selectedImagePreview : any;
  userImage : any;

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      fullName : ['', Validators.required],
      email : ['', Validators.required],
      phone : ['', Validators.required],
      password : ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword : ['',[Validators.required, Validators.minLength(6)]],
      roles : ['', [Validators.required, Validators.minLength(1)]],
      company : [''],
    })
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

  
  handlePasswordHide(e : any){
    this.alignhide = !this.alignhide;
    e.preventDefault();
  }
  submit() {
    const formData = new FormData;
      Object.keys(this.form.value).forEach(key => {
        formData.append(key, this.form.value[key]);
      });
      if(this.userImage){
        formData.append('image', this.userImage);
      }
      console.log(formData)
    this._authService.signup(formData).subscribe(
      res=>{
        this._messageService.showSuccessMessage(res.message);
      }
    )
  }

  goToLogin(e : any){
    e.preventDefault();
    this.router.navigate(['auth', 'login']);

  }
}
