import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TicketsTechComponent } from './tickets-tech.component';

const routes: Routes = [{ path: 'list-tickets', component: TicketsTechComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsTechRoutingModule { }
