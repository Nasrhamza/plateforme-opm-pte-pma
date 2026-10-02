import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AffecteTeamsComponent } from './affecte-teams.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbAccordionModule, NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { NgSelectModule } from '@ng-select/ng-select'; // Corrected import
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { TagInputModule } from 'ngx-chips';

@NgModule({
  declarations: [AffecteTeamsComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    FileUploadModule,
    AngularDualListBoxModule,
    TagInputModule,
    NgSelectModule // Use NgSelectModule instead
  ]
})
export class AffecteTeamsModule {}
