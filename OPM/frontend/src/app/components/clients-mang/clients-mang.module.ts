import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsMangRoutingModule } from './clients-mang-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUpdateTiketesCustomerComponent } from './add-update-tiketes-customer/add-update-tiketes-customer.component';
import { RaisenCancelTiketesComponent } from './raisen-cancel-tiketes/raisen-cancel-tiketes.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    AddUpdateTiketesCustomerComponent,
    RaisenCancelTiketesComponent
  ],
  imports: [
    CommonModule,
    ClientsMangRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    TranslateModule
  ]
})
export class ClientsMangModule { }
