import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TreeNode } from 'primeng/api';
// import { CompanyService } from 'src/app/core/services/company.service';
import { UserDetailsDialogComponent } from 'src/app/shared/dialogs/user-details-dialog/user-details-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-company-organigramme',
  standalone: true,
  imports: [
    SharedModule,
    UserDetailsDialogComponent
  ],
  templateUrl: './company-organigramme.component.html',
  styleUrl: './company-organigramme.component.scss'
})
export class CompanyOrganigrammeComponent implements OnInit{


  constructor(
    private _activatedRoute : ActivatedRoute,
    // private _company : CompanyService,
    public dialog: MatDialog,
  ){}

  usersOrganigram : TreeNode[] = [];
  imagesUrl = environment.userImagesUrl;

  ngOnInit(): void {
    // this._activatedRoute.paramMap.subscribe(
    //   (params : ParamMap) => {
    //     const id = params.get('id');
    //     if(!id) return;
    //     this._company.getUsersOrganigramme(id).subscribe(
    //       res => {
    //         this.usersOrganigram =  res ? res : [] 
    //       }
    //     )
    //   }
    // )    
  }

  showDetails(id : string){
    this.dialog.open(UserDetailsDialogComponent, { data : { id }, width : '500px' });
  }
}