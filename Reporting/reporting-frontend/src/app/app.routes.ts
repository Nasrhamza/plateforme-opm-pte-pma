import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      { path: 'opm',            loadComponent: () => import('./pages/opm/opm.component').then(m => m.OpmComponent) },
      { path: 'pte',            loadComponent: () => import('./pages/pte/pte.component').then(m => m.PteComponent) },
      { path: 'pma',            loadComponent: () => import('./pages/pma/pma.component').then(m => m.PmaComponent) },
      { path: 'report-builder', loadComponent: () => import('./pages/report-builder/report-builder.component').then(m => m.ReportBuilderComponent) },
      { path: 'report-builder/:id', loadComponent: () => import('./pages/report-builder/report-builder.component').then(m => m.ReportBuilderComponent) },
      { path: 'saved-reports/:id', loadComponent: () => import('./pages/report-view/report-view.component').then(m => m.ReportViewComponent) },
      { path: 'saved-reports',  loadComponent: () => import('./pages/saved-reports/saved-reports.component').then(m => m.SavedReportsComponent) },
      { path: 'users', canActivate: [adminGuard], loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent) },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
