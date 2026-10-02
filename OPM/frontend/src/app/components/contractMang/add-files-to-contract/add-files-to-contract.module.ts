import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileUploadModule } from '@iplab/ngx-file-upload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddFilesToContractComponent } from './add-files-to-contract.component';

import { NgbAccordionModule, NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';



@NgModule({
  declarations: [AddFilesToContractComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    FormsModule,
    FileUploadModule,

  ]
})
export class AddFilesToContractModule { }
