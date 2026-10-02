import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AddUserComponent } from './add-user/add-user.component';


@NgModule({
  declarations: [UserManagementComponent, AddUserComponent],
  imports: [
    CommonModule,
    TranslateModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    FormsModule,
    NgbDropdownModule,
    NgbModule,
    UserManagementRoutingModule
  ]
})
export class UserManagementModule { }
