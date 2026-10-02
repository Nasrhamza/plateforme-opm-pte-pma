import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '../guards/admin.guard';
import { TechnicianGuard } from '../guards/technician.guard';
import { CommercialGuard } from '../guards/commercial.guard';
import { PmoGuard } from '../guards/pmo.guard';

const routes: Routes = [
  { path: 'listContract', loadChildren: () => import('./contract-list/contract-list.module').then(m => m.ContractListModule) },
  { path: 'folderDetailes', loadChildren: () => import('./folder-detailes/folder-detailes.module').then(m => m.FolderDetailesModule) },
  { path: 'userManagement', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule), canActivate: [AdminGuard] },
  { path: 'listTickets', loadChildren: () => import('./list-tickets/list-tickets.module').then(m => m.ListTicketsModule), canActivate: [PmoGuard] },
  { path: 'ticketsTech', loadChildren: () => import('./tickets-tech/tickets-tech.module').then(m => m.TicketsTechModule), canActivate: [TechnicianGuard] },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
  { path: 'typesupports', loadChildren: () => import('./typesupports/typesupports.module').then(m => m.TypesupportsModule), canActivate: [PmoGuard] },
  { path: 'clanderVisitepreventive', loadChildren: () => import('./clander-visitepreventive/clander-visitepreventive.module').then(m => m.ClanderVisitepreventiveModule), },
  { path: 'chat/:id', loadChildren: () => import('./inline-chat/inline-chat.module').then(m => m.InlineChatModule) },
  { path: 'kpis', loadChildren: () => import('./kpis/kpis.module').then(m => m.KpisModule) },
  { path: 'knowledgeBase', loadChildren: () => import('./knowledge-base/knowledge-base.module').then(m => m.KnowledgeBaseModule) },
  { path: 'helpDesk', loadChildren: () => import('./help-desk/help-desk.module').then(m => m.HelpDeskModule) },
  { path: 'spare', loadChildren: () => import('./spare/spare.module').then(m => m.SpareModule) },
  { path: 'solutionRequests', loadChildren: () => import('./solution-requests/solution-requests.module').then(m => m.SolutionRequestsModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentsRoutingModule { }
