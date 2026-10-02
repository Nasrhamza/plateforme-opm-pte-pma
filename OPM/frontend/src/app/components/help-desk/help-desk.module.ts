import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HelpDeskRoutingModule } from './help-desk-routing.module';
import { HelpDeskComponent } from './help-desk.component';
import { FormsModule } from '@angular/forms';
import { AddTicketHelpdeskComponent } from './add-ticket/add-ticket-helpdesk/add-ticket-helpdesk.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ListUsersComponent } from './list-users-helpdesk/list-users/list-users.component';
import { AddUserComponent } from './list-users-helpdesk/list-users/add-user-helpdesk/add-user/add-user.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastyModule } from 'ng2-toasty';
import { SharedModule } from '../../theme/shared/shared.module';
import { MapComponent } from '../../map/map.component';
import { TranslateModule } from '@ngx-translate/core';
import { AddUpdateSitesComponent } from '../contractMang/add-update-sites/add-update-sites.component';


@NgModule({
  declarations: [HelpDeskComponent, AddTicketHelpdeskComponent, ListUsersComponent, AddUserComponent, MapComponent, AddUpdateSitesComponent],
  imports: [
    CommonModule,
    HelpDeskRoutingModule,
    NgbModule,
    NgSelectModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    NgbDropdownModule,
    FormsModule,
    TranslateModule,
    SharedModule,

    ToastyModule.forRoot()
  ]
})
export class HelpDeskModule { }
