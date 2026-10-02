import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRequestComponent } from './user-request/user-request.component';
import { RoomComponent } from './room/room.component';
import { ToolComponent } from './tool/tool.component';
import { TechnicianComponent } from './technician/technician.component';
import { VirtualisationEnvironmentComponent } from './virtualisation-environment/virtualisation-environment.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { MyRequestsComponent } from './virtualisation-environment/my-requests/my-requests.component';
import { LeaveComponent } from './leave/leave.component';
import { MyLeaveRequestsComponent } from './leave/my-leave-requests/my-leave-requests.component';
import { ProfileComponent } from './profile/profile.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ExternalUserComponent } from './external-user/external-user.component';
import { InternsRequestComponent } from './interns-request/interns-request.component';
import { OffersComponent } from './offers/offers.component';
import { AllOfferDetailsComponent } from './offers/all-offer-details/all-offer-details.component';
import { SelectedInternComponent } from './offers/selected-intern/selected-intern.component';
import { TasksComponent } from './tasks/tasks.component';
import { NetworkRequestsComponent } from './network-requests/network-requests.component';
import { DocsComponent } from './offers/selected-intern/docs/docs.component';
import { InventoryComponent } from './inventory/inventory.component';
import { EquipmentTypeComponent } from './inventory/equipment-type/equipment-type.component';
import { AccessoryTypeComponent } from './inventory/accessory-type/accessory-type.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'main',
    component: MainComponent,
  },
  {
    path: 'userList',
    component: UserListComponent,
  },
  {
    path: 'userRequest',
    component: UserRequestComponent,
  },
  {
    path: 'interns',
    component: InternsRequestComponent,
  },
  {
    path: 'offer',
    component: OffersComponent,
  },
  {
    path: 'offerDetails/:id',
    component: AllOfferDetailsComponent,
  },
  {
    path: 'offerTasks/:id',
    component: TasksComponent,
  },
  {
    path: 'selected-intern',
    component: SelectedInternComponent,
  },
  {
    path: 'intern-docs/:id',
    component: DocsComponent,
  },
  {
    path: 'external',
    component: ExternalUserComponent,
  },
  {
    path: 'vehicle',
    component: VehicleComponent,
  },
  {
    path: 'room',
    component: RoomComponent,
  },
  {
    path: 'tool',
    component: ToolComponent,
  },
  {
    path: 'technician',
    component: TechnicianComponent,
  },
  {
    path: 'virt-env',
    component: VirtualisationEnvironmentComponent,
  },
  {
    path: 'myRequest',
    component: MyRequestsComponent,
  },
  {
    path: 'leave',
    component: LeaveComponent,
  },
  {
    path: 'myLeave',
    component: MyLeaveRequestsComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  { 
    path :'user-profile/:id',
    component:UserProfileComponent
  },
  { 
    path :'networkRequests',
    component:NetworkRequestsComponent
  },
  { 
    path :'inventory',
    component:InventoryComponent
  },
  { 
    path :'equipment',
    component:EquipmentTypeComponent
  },
  { 
    path :'accessory',
    component:AccessoryTypeComponent
  },

 
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
