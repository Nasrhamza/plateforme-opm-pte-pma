import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolutionRequestsComponent } from './solution-requests.component';

const routes: Routes = [{ path: '', component: SolutionRequestsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolutionRequestsRoutingModule { }
