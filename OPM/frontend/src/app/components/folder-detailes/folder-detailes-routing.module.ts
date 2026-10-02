import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FolderDetailesComponent } from './folder-detailes.component';

const routes: Routes = [{ path: 'detailes/:id', component: FolderDetailesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FolderDetailesRoutingModule { }
