import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListTiketesCustomerComponent } from './list-tiketes-customer.component';

const routes: Routes = [{ path: 'tiketes-List', component: ListTiketesCustomerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListTiketesCustomerRoutingModule { }
