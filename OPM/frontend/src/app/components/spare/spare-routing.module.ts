import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpareComponent } from './spare.component';


const routes: Routes = [{ path: '', component: SpareComponent }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpareRoutingModule { }
