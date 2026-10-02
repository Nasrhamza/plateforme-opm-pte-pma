import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractListComponent } from './contract-list.component';

const routes: Routes = [{ path: '', component: ContractListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractListRoutingModule { }
