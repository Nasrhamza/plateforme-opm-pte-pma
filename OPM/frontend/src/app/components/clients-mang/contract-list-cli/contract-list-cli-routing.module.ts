import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractListCliComponent } from './contract-list-cli.component';

const routes: Routes = [{ path: '', component: ContractListCliComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractListCliRoutingModule { }
