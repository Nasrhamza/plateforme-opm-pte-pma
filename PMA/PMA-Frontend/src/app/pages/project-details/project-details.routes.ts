import { Routes } from "@angular/router";

export const ProjectDetailsRoutes: Routes = [
    {
        path : '',
        redirectTo : '',
        pathMatch : 'full'
    },
    {
        path : '',
        loadComponent : ()=>import("../projects/projects.component").then(c => c.ProjectsComponent)
    },
    {
        path : ':projectId/gantt',
        loadComponent : ()=>import("../gantt/gantt.component").then(c => c.GanttComponent)
    },
    {
        path : ':projectId/main',
        loadComponent : ()=>import('./project-details-layout/project-details-layout.component').then(c => c.ProjectDetailsLayoutComponent),
        children : [
            {
                path : '',
                redirectTo : 'details',
                pathMatch : 'full'
            },
            {
                path : 'details',
                loadComponent : ()=>import('./project-details-details/project-details.component').then(c => c.ProjectDetailsComponent),
            },
            {
                path : 'tasks',
                loadComponent : ()=>import('./project-details-tasks/project-details-tasks.component').then(c => c.ProjectDetailsTasksComponent),
            },
            {
                path : 'risks',
                loadComponent : ()=>import('./project-details-risks/project-details-risks.component').then(c => c.ProjectDetailsRisksComponent),
            },
            {
                path : 'reclamations',
                loadComponent : ()=>import('./project-details-reclamations/project-details-reclamations.component').then(c => c.ProjectDetailsReclamationsComponent),
            },
            {
                path : 'files',
                loadComponent : ()=>import('./project-details-files/project-details-files.component').then(c => c.ProjectDetailsFilesComponent),
            },
            {
                path : 'ratings',
                loadComponent : ()=>import('./project-ratings/project-ratings.component').then(c => c.ProjectRatingsComponent),
            }
        ]
    }
]