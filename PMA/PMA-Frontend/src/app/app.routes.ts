import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AccountSettingHomeComponent } from './pages/account-settings/account-setting-home/account-setting-home.component';
import { AdminGuard } from './core/guards/admin.guard';
import { EngnieerGuard } from './core/guards/engineer.guard';
import { LeaderGuard } from './core/guards/leader.guard';
import { ClientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/auth',
        pathMatch: 'full',
      },
      
      {
        path : 'tasks',
        loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent),
      },
      {
        path : 'tasks/:id',
        loadComponent: () => import('./pages/task-details/task-details.component').then(m => m.TaskDetailsComponent),
      },
      {
        path : 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      //projects route
      {
        path : 'projects',
        loadChildren : ()=>import('./pages/project-details/project-details.routes').then(m => m.ProjectDetailsRoutes),
      },
      {
        path: 'account',
        component: AccountSettingHomeComponent,
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./pages/account-settings/account-settings.routes').then(
                (m) => m.AccountSettingsRoutes
              ),
          },
        ],
      },
      {
        path: 'calendar',
        canActivate : [ AuthGuard ],
        loadComponent: () =>
          import('./pages/my-calendar/my-calendar.component').then((m) => m.MyCalendarComponent),
      },
      {
        path: 'admin',
        canActivate : [ AuthGuard, AdminGuard ],
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./routes/admin.routes').then(
                (m) => m.AdminRoutes
              ),
          },
        ],
      },
      {
        path: 'leader',
        canActivate : [ AuthGuard, LeaderGuard ],
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./routes/leader.routes').then(
                (m) => m.LeaderRoutes
              ),
          },
        ],
      },
      {
        path: 'engineer',
        canActivate : [ AuthGuard, EngnieerGuard ],
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./routes/engineer.routes').then(
                (m) => m.EngineerRoutes
              ),
          },
        ],
      },
      {
        path: 'client',
        canActivate : [ AuthGuard, ClientGuard ],
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./routes/client.routes').then(
                (m) => m.ClientRoutes
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'auth',
    component: BlankComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: ()=> import('./pages/page_not_found/page-not-found.component').then(m=>m.AppErrorComponent),
  },
];
