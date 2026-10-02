import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KpisRoutingModule } from './kpis-routing.module';
import { KpisComponent } from './kpis.component';


@NgModule({
  declarations: [KpisComponent],
  imports: [
    CommonModule,
    KpisRoutingModule
  ]
})
export class KpisModule { }
