import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TinymceModule} from 'angular2-tinymce';
import { InlineChatRoutingModule } from './inline-chat-routing.module';
import { InlineChatComponent } from './inline-chat.component';
import {SharedModule} from '../../theme/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { AddHsSpareComponent } from './add-hs-spare/add-hs-spare.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UpdateSpareComponent } from './update-spare/update-spare.component';
import { AddSolutionComponent } from './add-solution/add-solution.component';
import { RequestSolutionComponent } from './request-solution/request-solution.component';


@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    InlineChatRoutingModule,
    SharedModule,
    TinymceModule,
    TranslateModule
  ],
  declarations: [InlineChatComponent, AddHsSpareComponent, UpdateSpareComponent, AddSolutionComponent, RequestSolutionComponent]
})
export class InlineChatModule { }
