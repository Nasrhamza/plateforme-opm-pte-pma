import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path : '',
    redirectTo : 'auth',
    pathMatch : 'full'
  },
  {
    path: 'main',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'sample-page',
        pathMatch: 'full'
      },
      {
        path: 'clientMang',
        loadChildren: () => import('./components/clients-mang/clients-mang.module').then(m => m.ClientsMangModule ,)
      },

      {
        path: 'sample-page',
        loadChildren: () => import('./demo/extra/sample-page/sample-page.module').then(m => m.SamplePageModule)
      },
      {
        path: 'test',
        loadChildren: () => import('./components/components.module').then(m => m.ComponentsModule)
      }
    ]
  },
  
    {
      path: 'auth',
      loadChildren: () => import('./components/authentication/authentication.module').then(m => m.AuthenticationModule)
    },
    {
      path: 'unauthorized',
     
   
  loadChildren: () => import('./components/mainten-coming-soon/mainten-coming-soon.module').then(m => m.MaintenComingSoonModule) },
  { path: 'solution-requests', loadChildren: () => import('./components/solution-requests/solution-requests.module').then(m => m.SolutionRequestsModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
