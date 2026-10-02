import { Routes } from '@angular/router';
import { AccountSettingHomeComponent } from './account-setting-home/account-setting-home.component';

export const AccountSettingsRoutes: Routes = [
  {
    path: '',
    component: AccountSettingHomeComponent,
    children : [
        {
            path : '',
            redirectTo : 'main',
            pathMatch : 'full'
        },
        {
            path : 'main',
            loadComponent : ()=>import('./account-setting-home/account-setting-home.component').then(m => m.AccountSettingHomeComponent)
        },
        {
            path : 'security',
            loadComponent : ()=>import('./account-settings-security/account-settings-security.component').then(m => m.AccountSettingsSecurityComponent)
        },
        {
            path : 'profile',
            loadComponent : ()=>import('./account-settings-profile/account-settings-profile.component').then(m => m.AccountSettingsProfileComponent)
        },
    ]
  },
];
