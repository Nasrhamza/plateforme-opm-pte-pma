import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientGuard } from '../../guards/client.guard';
import { TechnicianGuard } from 'src/app/guards/technician.guard';



const routes: Routes = [
  
  { path: 'contract-List-Cli', loadChildren: () => import('./contract-list-cli/contract-list-cli.module').then(m => m.ContractListCliModule) },
  
  { path: 'customer-tickets', loadChildren: () => import('./list-tiketes-customer/list-tiketes-customer.module').then(m => m.ListTiketesCustomerModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule] 
})
export class ClientsMangRoutingModule { }
