import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FolderDetailesRoutingModule } from './folder-detailes-routing.module';
import { FolderDetailesComponent } from './folder-detailes.component';
import { SharedModule } from './../../theme/shared/shared.module'
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { DataTablesModule } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { DetailsSectionComponent } from './details-section/details-section.component';
import { SiteDetailsSectionComponent } from './site-details-section/site-details-section.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [FolderDetailesComponent, DetailsSectionComponent, DetailsSectionComponent, SiteDetailsSectionComponent],
  imports: [
    CommonModule,
    FolderDetailesRoutingModule,
    SharedModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    FormsModule,
    FileUploadModule,
    DataTablesModule,
    NgbTooltipModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    NgbPaginationModule
  ],
  providers: [
    DatePipe // Add DatePipe here
  ],
})
export class FolderDetailesModule { }
