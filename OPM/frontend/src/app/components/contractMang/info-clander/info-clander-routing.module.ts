import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoClanderComponent } from './info-clander.component';

const routes: Routes = [{ path: '', component: InfoClanderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfoClanderRoutingModule { }
