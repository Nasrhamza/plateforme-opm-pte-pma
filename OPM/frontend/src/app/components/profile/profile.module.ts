import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import {SharedModule} from  '../../theme/shared/shared.module'
// '../../../../../theme/shared/shared.module';
import {NgbCollapseModule, NgbDropdownModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import {NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    FormsModule,  
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgbTabsetModule,
    TranslateModule
  ],
  declarations: [ProfileComponent]
})
export class ProfileModule { }
