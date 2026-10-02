import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
    {
        path : '',
        redirectTo : 'home',
        pathMatch : 'full'
    },
    {
        path : 'dashboard',
        loadComponent : ()=>import('../pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path : 'engineers',
        loadComponent : ()=>import('../pages/users/users.component').then(m => m.UsersComponent),
        data : {
            role : 'Admin',
            searchedRole : 'Engineer',
            title : 'All Engineers'
        }
    },
    {
        path : 'gantt',
        loadComponent : ()=>import('../pages/gantt/gantt.component').then(m => m.GanttComponent),
        data : {
            role : 'Admin',
        }
    },
    {
        path : 'projects',
        data : {
            role : 'Admin',
            title : 'All Projects'
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
                loadChildren : ()=>import('../pages/project-details/project-details.routes').then(m => m.ProjectDetailsRoutes),
                data : {
                    role : 'Admin'
                }
            },
            {
                path : ':id/gantt',
                loadComponent : ()=>import('../pages/gantt/gantt.component').then(m => m.GanttComponent)
            },
        ]
    },
    {
        path: 'kpis',
        loadComponent:()=>import('../pages/kpis1/kpis1.component').then(m=> m.Kpis1Component),

    },
    {
        path : 'clients',
        loadComponent : ()=>import('../pages/users/users.component').then(m => m.UsersComponent),
        data : {
            role : 'Admin',
            searchedRole : 'Client',
            title : 'All Clients',
            page : 'clients'
        }
    },
    {
        path : 'teamleaders',
        loadComponent : ()=>import('../pages/users/users.component').then(m => m.UsersComponent),
        data : {
            role : 'Admin',
            searchedRole : 'Team Leader',
            title : 'All Team Leaders',
            page : 'teamleaders'
        }
    },
    {
        path : 'admins',
        loadComponent : ()=>import('../pages/users/users.component').then(m => m.UsersComponent),
        data : {
            role : 'Admin',
            searchedRole : 'Admin',
            title : 'All Admins',
            page : 'admins'
        }
    },
    {
        path : 'signup-requests',
        loadComponent : ()=>import('../pages/users/users.component').then(m => m.UsersComponent),
        data : {
            role : 'Admin',
            enabled : 'false',
            title : 'All Signup requests',
            page : 'signuprequests'
        }
    },
    {
        path : 'reclamations',
        loadComponent : ()=>import('../pages/reclamations/reclamations.component').then(m => m.ReclamationsComponent),
        data : {
            role : 'Admin',
            title : 'All Reclamations'
        }
    },
    {
        path : 'risks',
        loadComponent : ()=>import('../pages/risks/risks.component').then(m => m.RisksComponent),
        data : {
            role : 'Admin',
            title : 'All Risks'
        }
    },
    {
        path : 'tasks',
        children : [
            {
                path : '',
                loadComponent : ()=>import('../pages/tasks/tasks.component').then(m => m.TasksComponent),
            },
            {
                path : ':id',
                loadComponent : ()=>import('../pages/task-details/task-details.component').then(m => m.TaskDetailsComponent),
            },
            {
            path : '',
            loadComponent : ()=>import('../pages/tasks/tasks.component').then(m => m.TasksComponent)
        },
        ]
    },
    {
        path : 'proces-verbaux',
        loadComponent : ()=>import('../pages/proces-verbaux/proces-verbaux.component').then(m => m.ProcesVerbauxComponent),
        data : {
            role : 'Admin',
            title : 'All Proces'
        }
    },
    {
        path : 'appreciation-letters',
        loadComponent : ()=>import('../pages/appreciation-letters/appreciation-letters.component').then(m => m.AppreciationLettersComponent)
    }
];
