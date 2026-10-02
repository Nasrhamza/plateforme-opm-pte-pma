import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KpisComponent } from './kpis.component';

const routes: Routes = [{ path: '', component: KpisComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KpisRoutingModule { }
