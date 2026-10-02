import { Routes } from '@angular/router';

export const LeaderRoutes: Routes = [
    {
        path : '',
        redirectTo : 'dashboard',
        pathMatch : 'full'
    },
    {
        path : 'dashboard',
        loadComponent : ()=>import('../pages/leader-dashboard/leader-dashboard.component').then(m => m.LeaderDashboardComponent)
    },
    {
        path : 'projects',
        // loadComponent : ()=>import('../pages/projects/projects.component').then(m => m.ProjectsComponent),
        data : {
            role : 'Team Leader'
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
            {
                path : ':id/gantt',
                loadComponent : ()=>import('../pages/gantt/gantt.component').then(m => m.GanttComponent)
            },
        ]
    },
    {
        path : 'tasks',
        loadComponent : ()=>import('../pages/tasks/tasks.component').then(m => m.TasksComponent),
        data : {
            role : 'Team Leader',
        }
    },
    {
        path : 'risks',
        loadComponent : ()=>import('../pages/risks/risks.component').then(m => m.RisksComponent),
        data : {
            role : 'Team Leader',
        }
    },
    {
        path : 'proces-verbaux',
        loadComponent : ()=>import('../pages/proces-verbaux/proces-verbaux.component').then(m => m.ProcesVerbauxComponent),
        data : {
            role : 'Team Leader',
        }
    },
    {
        path : 'reclamations',
        loadComponent : ()=>import('../pages/reclamations/reclamations.component').then(m => m.ReclamationsComponent),
        data : {
            role : 'Team Leader',
        }
    }
];
