import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';

import { SolutionRequestsRoutingModule } from './solution-requests-routing.module';
import { SolutionRequestsComponent } from './solution-requests.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [SolutionRequestsComponent],
  imports: [
    CommonModule,
    SolutionRequestsRoutingModule,
    TranslateModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    NgSelectModule
  ]
})
export class SolutionRequestsModule { }
