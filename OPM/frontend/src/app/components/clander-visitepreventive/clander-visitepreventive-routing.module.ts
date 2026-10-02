import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClanderVisitepreventiveComponent } from './clander-visitepreventive.component';

const routes: Routes = [{ path: '', component: ClanderVisitepreventiveComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClanderVisitepreventiveRoutingModule { }
