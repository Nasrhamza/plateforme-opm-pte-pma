import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbButtonsModule, NgbDropdownModule, NgbPaginationModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import {BarRatingModule} from 'ngx-bar-rating';
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { TicketsTechRoutingModule } from './tickets-tech-routing.module';
import { TicketsTechComponent } from './tickets-tech.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { RapportInterventionComponent } from './rapport-intervention/rapport-intervention.component';
import {TinymceModule} from 'angular2-tinymce';
import { TranslateModule } from '@ngx-translate/core';




@NgModule({
  declarations: [TicketsTechComponent, RapportInterventionComponent],
  imports: [
    CommonModule,
    NgbDropdownModule,
    DataTablesModule,
    Ng2SearchPipeModule,
    BarRatingModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbButtonsModule,
    NgbPaginationModule,
    TicketsTechRoutingModule,
    SharedModule,
    TinymceModule,
    FormsModule,
    TranslateModule
  ]
})
export class TicketsTechModule { }
