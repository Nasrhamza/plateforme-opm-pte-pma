import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListTicketsComponent } from './list-tickets.component';

const routes: Routes = [{ path: 'detailes/:id', component: ListTicketsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListTicketsRoutingModule { }
