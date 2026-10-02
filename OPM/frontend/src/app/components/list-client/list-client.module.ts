import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ListClientRoutingModule } from './list-client-routing.module';
import { ListClientComponent } from './list-client.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { SamplePageRoutingModule } from '../../demo/extra/sample-page/sample-page-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [ListClientComponent, ],
  imports: [
    CommonModule,
    ListClientRoutingModule,
    SamplePageRoutingModule,
    NgbDropdownModule,
    NgbModule,
    FormsModule,
    DataTablesModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    TranslateModule,
    SharedModule,


  ]
})
export class ListClientModule { }
