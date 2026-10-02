import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ContractListRoutingModule } from './contract-list-routing.module';
import { ContractListComponent } from './contract-list.component';
import { SharedModule } from '../../theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [ContractListComponent],
  imports: [
    CommonModule,
    ContractListRoutingModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule
  ]
})
export class ContractListModule { }
