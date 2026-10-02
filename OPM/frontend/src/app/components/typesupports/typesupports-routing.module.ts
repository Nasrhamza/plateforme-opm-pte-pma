import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TypesupportsComponent } from './typesupports.component';

const routes: Routes = [{ path: '', component: TypesupportsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TypesupportsRoutingModule { }
