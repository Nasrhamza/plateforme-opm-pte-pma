import { AfterViewInit, Component , OnDestroy, OnInit} from '@angular/core';
import 'dhtmlx-gantt';
import { gantt } from 'dhtmlx-gantt';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, tap } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { FormControl } from '@angular/forms';
import { TaskDetailsDialogComponent } from 'src/app/shared/dialogs/task-details-dialog/task-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface Taskgantt {
  _id: string;
  Title: string;
  Project: string;
  Details: string;
  Status: string;
  StartDate: Date;
  Deadline: Date;
  Executor: string[];
  progress: number;
  Priority: string;
  closedAt? : Date
}

@Component({
  selector: 'app-gantt',
  standalone : true,
  imports : [
    SharedModule
  ],
  templateUrl: './gantt.component.html',
  styleUrls: ['./gantt.component.scss']
})
export class GanttComponent implements OnInit, OnDestroy, AfterViewInit {
  searchInput: string = '';
  allProjects: any[] = [];
  allTasks: any[] = [];
  originalTasks: any[] = [];
  selectedTask: any;
  search : FormControl;
  selectedProjet: any;
  tasks : any = [];
  showModal: boolean = false;
  private projectId: string | null = null;
  taskCountcomp: number=0;
  taskCountover: number=0;
  selectedFilter: string = 'all'; 
  filterOptions = ['all', 'week', 'month', 'year', 'more-than-year'];
  ongoingProjectsCount = 0;
  completedProjectsCount = 0;
  totalproject: number;
  totaltasks: number;
  constructor(
    private projectsService: ProjectService,
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private dialog : MatDialog
  ) {}

  ngOnInit(): void {
    this.search = new FormControl('');
    this.handleProjectSearch()
    this.route.paramMap.pipe(
      tap(params => {
        this.projectId = params.get('id'); 
        this.loadProjectsAndTasks();
        this.setupGantt();
      })
    ).subscribe()
    this.handletaskClick();
  }

  ngAfterViewInit(): void {
    this.setupGantt();
  }

  setupGantt(): void {
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F, %Y" },
      { unit: "day", step: 1, format: "%j, %D" }
    ];
    gantt.config.scale_height = 50;

    gantt.config.columns = [
      { name: "text", label: "Task/Project Name", width: "*", tree: true },
      { name: "duration", label: "Duration", align: "center" },
      { name: "priority", label: "Priority", align: "center" }
    ];

    gantt.templates.grid_row_class = (start, end, task) => {
      if (task['priority']) {
        return `priority-${task['priority'].toLowerCase()}`;
      }
      return '';
    };

    gantt.templates.task_class = (start, end, task) => {
      if (task.type === 'project') {
        return 'project-task';
      }
      return '';
    };

    gantt.config.lightbox = {};
    gantt.config.drag_progress = false;
    gantt.config.bar_height = 20;
    gantt.config.drag_links = false;
    gantt.config.drag_resize = false;
    gantt.config.drag_move = false;

    gantt.init('gantt_here');
  }
  handletaskClick(){
    gantt.attachEvent("onTaskClick", (id, e:any) => {
      if ((e.target as HTMLElement).classList.contains("gantt_tree_icon")) {
        return true;
      }
      const task = gantt.getTask(id);
      if (task.type === 'task') {
        this.dialog.open(TaskDetailsDialogComponent, { data : { id : task.id.toString() }, width : '700px' });
        return true;
      }
      return false;
    });
  };

  loadProjectsAndTasks(): void {
    if (this.projectId) {
        this.loadSingleProject(this.projectId);
    } else {
        this.loadAllProjects();
    }
    this.getTotalTasks()
}


loadSingleProject(projectId: string): void {
    this.projectsService.findById(projectId).subscribe(
        (project: any) => {
            const projectTask = this.createProjectAsTask(project);
            const tasks = [projectTask];
            this.allProjects.push(projectTask);
            this.allTasks.push(projectTask);

            this.tasksService.findAll({Project: projectId}).subscribe(
                res => {
                    this.addTasksToProject(res.data!.tasks, projectTask.id, tasks);
                    gantt.parse({ data: tasks });
                    this.originalTasks = [...this.allTasks];
                },
                (error) => {
                    console.error(`Error fetching tasks for Project ${projectId}:`, error);
                }
            );
        }
    );
}

loadAllProjects(): void {
    this.projectsService.findAll().subscribe(
        res => {
            let projectTaskCount = res.data!.projects.length;

            res.data!.projects.forEach((project) => {
                const projectTask = this.createProjectAsTask(project);
                this.tasks.push(projectTask);
                this.allProjects.push(projectTask);
                this.allTasks.push(projectTask);

                this.tasksService.findAll({ Project : project._id}).subscribe(
                    res => {
                        this.addTasksToProject(res.data!.tasks, projectTask.id, this.tasks);
                        projectTaskCount--;
                        if (projectTaskCount === 0) {
                            gantt.parse({ data: this.tasks });
                            this.originalTasks = [...this.allTasks];
                        }
                    },
                    (error) => {
                        console.error(`Error fetching tasks for Project ${project._id}:`, error);
                        projectTaskCount--;
                        if (projectTaskCount === 0) {
                            gantt.parse({ data: this.tasks });
                            this.originalTasks = [...this.allTasks];
                        }
                    }
                );
            });
        }
    );
}

createProjectAsTask(project: any): any {
  if(project.data) project = project.data;
    const startDate = this.formatDate(project.dateDebut);
    const endDate = this.formatDate(project.dateFin);
    const data =  {
        id: project._id,
        text: project.Projectname,
        start_date: startDate,
        duration: this.calculateDuration(startDate, endDate),
        progress: project.progress / 100,
        priority: project.priority,
        open: true,
        type: 'project',
        color: '#e3e3e3',
    };
    return data
}

addTasksToProject(taskList: any, parentId: string, tasks: any[]): void {
  taskList.forEach((task : any) => {
      let taskStartDate = this.formatDate(task.StartDate);
      let taskEndDate = this.formatDate(task.Deadline);

      if (taskStartDate === taskEndDate) {
          const [day, month, year] = taskEndDate!.split('-').map(Number);
          const endDateObject = new Date(year, month - 1, day);
                    endDateObject.setDate(endDateObject.getDate() + 1);
                    const newDay = String(endDateObject.getDate()).padStart(2, '0');
          const newMonth = String(endDateObject.getMonth() + 1).padStart(2, '0');
          const newYear = endDateObject.getFullYear();
          taskEndDate = `${newDay}-${newMonth}-${newYear}`;
      }

      const { color, borderColor } = this.getTaskStyles(task);
      this.countupdate(task);

      const ganttTask = {
          id: task._id,
          text: task.Title,
          start_date: taskStartDate,
          end_date: taskEndDate,
          duration: this.calculateDuration(taskStartDate, taskEndDate),
          progress: task.progress / 100,
          priority: task.Priority,
          parent: parentId,
          type: 'task',
          color: color,
          borderColor: borderColor,
          closedAt: task.closedAt ? this.formatDate(task.closedAt) : null,
      };

      tasks.push(ganttTask);
      this.allTasks.push(ganttTask);
  });
}

onSearchChange(e: any): void {
  this.searchInput = e.target.value.toLowerCase();
  this.handleProjectSearch();
}

handleProjectSearch(): void {
  this.search.valueChanges
  .pipe(
    debounceTime(500),
    tap(value => {
      if(!value){
        gantt.clearAll();
        gantt.parse({ data: this.originalTasks });
        gantt.render();
      }else{
        this.searchInput = value;
        const filteredProjects = this.allProjects.filter(project => 
          project.text.toLowerCase().includes(this.searchInput)
        );      
        const filteredTasks:any[] = [];
        filteredProjects.forEach(project => {
          filteredTasks.push(project);
          this.allTasks.forEach(task => {
            if (task.parent === project.id || task.text.toLowerCase().includes(this.searchInput)) {
              filteredTasks.push(task);
            }
          });
        });
        gantt.clearAll();
        gantt.parse({ data: filteredTasks });
        gantt.render();
      }
    })
  )
  .subscribe()
}

  closeModal(): void {
    this.showModal = false;
  }

  ngOnDestroy(): void {
    gantt.clearAll();
  }

  private formatDate(date: Date): string | null {
    if (!date) return null;

    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private calculateDuration(startDate: string | null, endDate: string | null): number {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate.split('-').reverse().join('-'));
    const end = new Date(endDate.split('-').reverse().join('-'));
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getTaskStyles(task: Taskgantt): { color: string; borderColor: string } {
    const currentDate = new Date();
    const endDate = new Date(task.Deadline);
    const closedAt = task.closedAt ? new Date(task.closedAt) : null;

    let color = '';
    let borderColor = ''; 

    if (task.progress === 100) {
        if (closedAt && closedAt <= endDate) {
            color = '#24c651'; // Green
        } else if (closedAt && closedAt > endDate) {
            color = '#ffd541'; // Orange
        }
    } else if (currentDate > endDate) {
        color = '#fe4a23'; // Red
    }

    borderColor = color ? color : 'transparent'; 

    return { color, borderColor };
}

  private isoverdue(task: Taskgantt): boolean {
    const currentDate = new Date();
    const endDate = new Date(task.Deadline);
    const timeDifference = endDate.getTime() - currentDate.getTime();
    return timeDifference < 0 && task.progress < 100;
  }
  private iscompleted(task: Taskgantt): boolean {
    return task.progress == 100;
  }
  private countupdate(task: Taskgantt){
    if (this.iscompleted(task)){
      this.taskCountcomp++;}else if (this.isoverdue(task)){
        this.taskCountover++;}
}
getTotalProjects(): number {
  return this.totalproject= this.allProjects.length;
}
getTotalTasks(): number {
  this.totaltasks = this.allTasks.filter(task => task.type === 'task').length;
  return this.totaltasks;
}
calculateProjectStatuses(projects : any[]) {
  let completedProjectsCount = 0;
  let ongoingProjectsCount = 0;

  const currentDate = new Date();

  projects.forEach(project => {
    const projectTasks = this.allTasks.filter(task => task.parent === project.id);

    if (projectTasks.length > 0) {
      let allTasksCompleted = true; 
      let hasOngoingTasks = false;  

      projectTasks.forEach(task => {
        const isTaskCompleted = task.progress === 1; 
        const isTaskOngoing = task.progress < 1 && task.end_date > currentDate; 

        if (!isTaskCompleted) {
          allTasksCompleted = false;
        }

        if (isTaskOngoing) {
          hasOngoingTasks = true;
        }
      });

      if (allTasksCompleted) {
        completedProjectsCount++;
      } 
      
      if (hasOngoingTasks) {
        ongoingProjectsCount++;
      }
    }
  });
  return { completedProjectsCount, ongoingProjectsCount }
}

onFilterChange(event: string): void {
  this.selectedFilter = event;
  this.applyFilter();
}

applyFilter(): void {
  const currentDate = this.stripTime(new Date()); 

  let filteredProjects = this.allProjects.map(project => {
    const startDate = new Date(project.start_date);
    if (isNaN(startDate.getTime())) {
      return null;
    }
    return { ...project, start_date: this.stripTime(startDate) };
  }).filter(project => project !== null);

  switch (this.selectedFilter) {
    case 'week':
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      filteredProjects = filteredProjects.filter(project =>
        project.start_date >= this.stripTime(startOfWeek) && project.start_date <= currentDate
      );
      break;

    case 'month':
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      filteredProjects = filteredProjects.filter(project =>
        project.start_date >= this.stripTime(startOfMonth) && project.start_date <= currentDate
      );
      break;

    case 'year':
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      filteredProjects = filteredProjects.filter(project =>
        project.start_date >= this.stripTime(startOfYear) && project.start_date <= currentDate
      );
      break;

    case 'more-than-year':
      const startOfPastYear = new Date(currentDate.getFullYear() - 1, 0, 1);
      filteredProjects = filteredProjects.filter(project =>
        project.start_date < this.stripTime(startOfPastYear)
      );
      break;

    case 'all':
    default:
      filteredProjects = this.allProjects;
      break;
  }

  const filteredProjectIds = filteredProjects.map(project => project.id);

  const filteredTasks = this.originalTasks.filter(task =>
    filteredProjectIds.includes(task.parent)
  );

  this.updateGanttChart(filteredProjects, filteredTasks);
}

private stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
private updateGanttChart(filteredProjects: any[], filteredTasks: any[]): void {
  try {
    gantt.clearAll();
    gantt.parse({ data: [...filteredProjects, ...filteredTasks] });
    gantt.render();
  } catch (error) {
    console.error('Error updating Gantt chart:', error);
  }
}}