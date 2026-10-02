import { Routes } from '@angular/router';

export const EngineerRoutes: Routes = [
    {
        path : '',
        redirectTo : 'dashboard',
        pathMatch : 'full'
    },
    {
        path : 'dashboard',
        loadComponent : ()=>import('../pages/engineer-dashboard/engineer-dashboard.component').then(m => m.EngineerDashboardComponent)
    },
    {
        path : 'team',
        loadComponent : ()=>import('../pages/my-team/my-team.component').then(m => m.MyTeamComponent),
    },
    {
        path : 'projects',
        // loadComponent : ()=>import('../pages/projects/projects.component').then(m => m.ProjectsComponent),
        data : {
            role : 'Engineer'
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
        path : 'tasks',
        loadComponent : ()=>import('../pages/tasks/tasks.component').then(m => m.TasksComponent),
        data : {
            role : 'Engineer',
        }
    },
    {
        path : 'risks',
        loadComponent : ()=>import('../pages/risks/risks.component').then(m => m.RisksComponent),
        data : {
            role : 'Engineer',
        }
    }
];
