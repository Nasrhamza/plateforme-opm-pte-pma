import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/users.service';
import { tap } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'src/app/core/services/message.service';

@Component({
  selector: 'app-share-file-dialog',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './share-file-dialog.component.html',
  styleUrl: './share-file-dialog.component.scss'
})
export class ShareFileDialogComponent implements OnInit{

  constructor(
    private _userService : UserService,
    private _projectService : ProjectService,
    private _messageService : MessageService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  loading = false;
  users : User[]= [];
  suggestedUsers : User[]= [];

  email : FormControl;
  ngOnInit(): void {
    this.email = new FormControl('', Validators.required)
    this.fetchUsers()
    this.email.valueChanges.pipe(
      tap(value => {
        this.handleSearch(value)
      })
    ).subscribe()
  }

  submit(){
    if(!this.email.value){
      this._messageService.showErrorMessage("Invalid email");
      return;
    }
    this.loading = true;
    this._projectService.sendfile({ fileName : this.data.file, projectName : this.data.projectName, receiverEmail : this.email.value }).subscribe(
      res=>{
        this.loading = false;
        this._messageService.showSuccessMessage(res.message);
      }
    );
  }

  fetchUsers(){
    this._userService.findAll({ roles : ['Team Leader','Engineer'] }).subscribe(
      res => {
        this.users = res.data!.users!
      }
    )
  }

  handleSearch(e : any){
    if(e){
      this.suggestedUsers = this.users.filter(u => u.email.toLowerCase().includes(e))
    }else{
      this.suggestedUsers = []
    }
  }

  handleUserSelect(value: string){
    this.email.patchValue(value);
    this.suggestedUsers = []
  }

}
