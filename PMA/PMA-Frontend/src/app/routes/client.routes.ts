import { Routes } from '@angular/router';

export const ClientRoutes: Routes = [
    {
        path : '',
        redirectTo : 'dashboard',
        pathMatch : 'full'
    },
    {
        path : 'dashboard',
        loadComponent : ()=>import('../pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
    },
    {
        path : 'projects',
        // loadComponent : ()=>import('../pages/projects/projects.component').then(m => m.ProjectsComponent),
        data : {
            role : 'Client'
        },
        children : [
            {
                path : '',
                redirectTo : '',
                pathMatch : 'full'
            },
            {
                path : '',
                loadComponent : ()=>import('../pages/projects/projects.component').then(m => m.ProjectsComponent),
            },
            {
                path : ':id',
                loadChildren : ()=>import('../pages/project-details/project-details.routes').then(m => m.ProjectDetailsRoutes)
            },
        ]
    },
    {
        path : 'reclamations',
        loadComponent : ()=>import('../pages/reclamations/reclamations.component').then(m => m.ReclamationsComponent),
        data : {
            role : 'Client',
        }
    }
];
