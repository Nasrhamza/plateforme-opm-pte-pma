export interface TasksOverview {
    totalTasks: number;
    overdueTasks: number;
    overdueRate: string; 
    closedTasks: number;
    closedRate: string;    
    pendingTasks: number;
    avgProgress: string;   
    priorities: Record<string, number>;
    statusDist: Record<string, number>;
}

export interface ProjectsOverview {
    totalProjects: number;
    closedProjects: number;
    closedRate: string;     
    overdueProjects: number;
    overdueRate: string;     
    avgProgress: string;     
    priorities: Record<string, number>; 
    statusDist: Record<string, number>; 
    notes: {
        avgTeamLeaderNote: string;
        avgClientNote: string;
        avgAdminNote: string;
        avgFinalRating: string;
    };
    files: {
        withFilesConfig: number;
        withLetter: number;
        filesProvidedRate: string;
    };
    avgDurationDays: number;
}