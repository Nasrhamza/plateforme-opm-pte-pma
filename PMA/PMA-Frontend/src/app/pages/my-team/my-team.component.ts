import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EMPTY, switchMap, take } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { UserDetailsDialogComponent } from 'src/app/shared/dialogs/user-details-dialog/user-details-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.scss'
})
export class MyTeamComponent implements OnInit{


  constructor(
    private _project : ProjectService,
    private _auth : AuthService,
    public dialog: MatDialog,
    public router : Router
  ){}

  teams : { project : Project, team : User[] }[] = [];
  imagesUrl = environment.userImagesUrl;

  ngOnInit(): void {
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user => {
        if(!user) return EMPTY;
        if(user.roles.includes('Engineer')){
          return this._project.getMyTeams({ equipe: user.id })
        } 
        return EMPTY;
      })
    ).subscribe(res => {
      this.teams = res.data
    })
  }

  showUserDetails(id : string){
    this.dialog.open(UserDetailsDialogComponent, { data : { id }, width : '500px' });
  }

}
