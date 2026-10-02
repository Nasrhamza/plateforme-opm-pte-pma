import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TypesupportsRoutingModule } from './typesupports-routing.module';
import { TypesupportsComponent } from './typesupports.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';



@NgModule({
  declarations: [TypesupportsComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    TypesupportsRoutingModule,
    SharedModule,
    FormsModule,
    Ng2SearchPipeModule
  ]
})
export class TypesupportsModule { }
