import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeBaseRoutingModule } from './knowledge-base-routing.module';
import { KnowledgeBaseComponent } from './knowledge-base.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TinymceModule} from 'angular2-tinymce';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [KnowledgeBaseComponent],
  imports: [
    CommonModule,
    KnowledgeBaseRoutingModule,
    FormsModule ,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    NgbModule,
    TinymceModule,
    TranslateModule
  ]
})
export class KnowledgeBaseModule { }
