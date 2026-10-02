import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractListCliRoutingModule } from './contract-list-cli-routing.module';
import { ContractListCliComponent } from './contract-list-cli.component';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbDropdownModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';


@NgModule({
  declarations: [ContractListCliComponent],
  imports: [
    CommonModule,
    ContractListCliRoutingModule,
    SharedModule,
    FormsModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgbPopoverModule,
    
  ]
})
export class ContractListCliModule { }
