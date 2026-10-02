import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpDeskComponent } from './help-desk.component';
import { ListUsersComponent } from './list-users-helpdesk/list-users/list-users.component';

const routes: Routes = [
  { path: '', component: HelpDeskComponent },
  { path: 'list-user', component: ListUsersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpDeskRoutingModule { }
