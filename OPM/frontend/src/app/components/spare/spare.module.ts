import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpareRoutingModule } from './spare-routing.module';
import { SpareComponent } from './spare.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddSpareComponent } from './add-spare/add-spare.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [SpareComponent, AddSpareComponent],
  imports: [
    CommonModule,
    SpareRoutingModule,
    TranslateModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    NgSelectModule
  ]
})
export class SpareModule { }
