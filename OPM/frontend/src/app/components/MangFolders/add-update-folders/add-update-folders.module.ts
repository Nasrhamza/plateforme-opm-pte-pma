import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AddUpdateFoldersComponent } from './add-update-folders.component';
import { NgbAccordionModule, NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import {ColorPickerModule} from 'ngx-color-picker';



@NgModule({
  declarations: [AddUpdateFoldersComponent],
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    FormsModule,
    ColorPickerModule,
    NgbDatepickerModule,

    FileUploadModule,
  ]
})
export class AddUpdateFoldersModule { }
