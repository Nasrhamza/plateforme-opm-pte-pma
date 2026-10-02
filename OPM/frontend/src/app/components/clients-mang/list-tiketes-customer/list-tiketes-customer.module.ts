import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListTiketesCustomerRoutingModule } from './list-tiketes-customer-routing.module';
import { ListTiketesCustomerComponent } from './list-tiketes-customer.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgbButtonsModule, NgbDropdownModule, NgbPaginationModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { BarRatingModule } from 'ngx-bar-rating';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [ListTiketesCustomerComponent],
  imports: [
    CommonModule,
    ListTiketesCustomerRoutingModule,
    SharedModule,
    NgbDropdownModule,
    DataTablesModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbButtonsModule,
    NgbPaginationModule,
    BarRatingModule,
    TranslateModule


  ],
})
export class ListTiketesCustomerModule { }
