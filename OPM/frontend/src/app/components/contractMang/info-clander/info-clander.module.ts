import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfoClanderRoutingModule } from './info-clander-routing.module';
import { InfoClanderComponent } from './info-clander.component';
import {SharedModule} from '../../../theme/shared/shared.module'
// '../../../../theme/shared/shared.module';

@NgModule({
  declarations: [InfoClanderComponent],
  imports: [
    CommonModule,
    InfoClanderRoutingModule,
    SharedModule
  ]
})
export class InfoClanderModule { }
