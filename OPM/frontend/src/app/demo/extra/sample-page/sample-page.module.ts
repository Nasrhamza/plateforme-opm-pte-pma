import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SamplePageRoutingModule } from './sample-page-routing.module';
import { SamplePageComponent } from './sample-page.component';
import { SharedModule } from '../../../theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { BarRatingModule } from 'ngx-bar-rating';
import { TranslateModule } from '@ngx-translate/core';
import { SatisfactionChartComponent } from './chart/satisfaction-chart.component';
import { ApexBarChartComponent } from './chart/apex-bar-chart.component';
import { ApexTechnicianChartComponent } from './chart/apex-technician-chart.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
  imports: [
    CommonModule,
    NgbPopoverModule,
    SamplePageRoutingModule,
    SharedModule,
    FormsModule,
    BarRatingModule,
    TranslateModule,
    NgApexchartsModule,
    ScrollingModule,
    Ng2SearchPipeModule

  ],
  declarations: [
    SamplePageComponent,
    SatisfactionChartComponent,
    ApexBarChartComponent,
    ApexTechnicianChartComponent
  ]
})
export class SamplePageModule { }
