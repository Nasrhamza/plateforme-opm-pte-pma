import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { KpiDatum } from '../../core/models/reporting.models';
import { GlobalPeriodService } from '../../core/services/global-period.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';

type Slice = { label: string; value: number; colorClass: string };

@Component({
  selector: 'app-pma',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FilterBarComponent],
  templateUrl: './pma.component.html',
})
export class PmaComponent implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);

  totalProjects     = signal(0);
  inProgressProjects = signal(0);
  completedProjects  = signal(0);
  overdueProjects    = signal(0);
  avgProgress        = signal(0);
  totalLeaderScore   = signal(0);

  taskPriority      = signal<Slice[]>([]);
  workload          = signal<KpiDatum[]>([]);
  onTimeDelivery    = signal<KpiDatum[]>([]);
  teamLeaderScores  = signal<KpiDatum[]>([]);
  private periodSub?: Subscription;

  // Entity filters
  filterEngineer  = signal('');
  filterLeader    = signal('');

  engineerOptions = computed(() =>
    [...new Set(this.workload().map(r => String(r['engineer'] ?? '')))].filter(Boolean).sort()
  );
  leaderOptions = computed(() =>
    [...new Set(this.teamLeaderScores().map(r => String(r['team_leader'] ?? '')))].filter(Boolean).sort()
  );

  filteredWorkload = computed(() => {
    const e = this.filterEngineer();
    return e ? this.workload().filter(r => String(r['engineer'] ?? '') === e) : this.workload();
  });
  filteredLeaderScores = computed(() => {
    const l = this.filterLeader();
    return l ? this.teamLeaderScores().filter(r => String(r['team_leader'] ?? '') === l) : this.teamLeaderScores();
  });
  filteredTotalLeaderScore = computed(() =>
    this.filteredLeaderScores().reduce((s, r) => s + this.num(r.value), 0)
  );

  constructor(
    private dataService: DataService,
    private periodService: GlobalPeriodService
  ) {}

  ngOnInit(): void {
    this.periodSub = this.periodService.state$.subscribe(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.filterEngineer.set('');
    this.filterLeader.set('');
    const filters = this.periodService.currentFilters();

    forkJoin({
      projectsByStatus:  this.dataService.getPmaPortfolioStatus(filters),
      projectsOverdue:   this.dataService.getPmaOverdueIndex(filters),
      tasksByStatus:     this.dataService.getPmaTasksByStatus(filters),
      tasksByPriority:   this.dataService.getPmaTasksByPriority(filters),
      workload:          this.dataService.getPmaEngineerProductivity(filters),
      onTimeDelivery:    this.dataService.getPmaOnTimeDelivery(filters),
      teamLeaderScore:   this.dataService.getPmaTeamLeaderScore(filters),
    }).subscribe({
      next: ({ projectsByStatus, projectsOverdue, tasksByStatus, tasksByPriority, workload, onTimeDelivery, teamLeaderScore }) => {
        const projectRows = projectsByStatus.data;
        this.totalProjects.set(projectRows.reduce((s, i) => s + this.num(i.value), 0));
        this.inProgressProjects.set(projectRows.filter(r => String(r['status'] ?? '').toLowerCase().includes('progress')).reduce((s, i) => s + this.num(i.value), 0));
        this.completedProjects.set(projectRows.filter(r => String(r['status'] ?? '').toLowerCase().includes('completed')).reduce((s, i) => s + this.num(i.value), 0));
        const overdueAgg = this.aggBy(projectsOverdue.data, 'project', 'avg');
        const overdueVals = overdueAgg.map(r => this.num(r.value));
        this.overdueProjects.set(overdueVals.length ? Math.round(overdueVals.reduce((s, v) => s + v, 0) / overdueVals.length) : 0);

        const statusAgg = this.aggBy(tasksByStatus.data, 'status', 'sum');
        const tasksTotal = statusAgg.reduce((s, i) => s + this.num(i.value), 0);
        const tasksDone  = statusAgg.filter(r => String(r['status'] ?? '').toLowerCase().includes('completed')).reduce((s, i) => s + this.num(i.value), 0);
        this.avgProgress.set(tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0);

        const priorityAgg = this.aggBy(tasksByPriority.data, 'priority', 'sum');
        this.taskPriority.set(
          priorityAgg.slice(0, 4).map((row, idx) => ({
            label: String(row['priority'] ?? `Priority ${idx + 1}`),
            value: this.num(row.value),
            colorClass: ['bg-error', 'bg-orange-500', 'bg-secondary', 'bg-slate-400'][idx] ?? 'bg-slate-400',
          }))
        );

        this.workload.set(this.aggBy(workload.data, 'engineer', 'sum').slice(0, 10));
        this.onTimeDelivery.set(onTimeDelivery.data.slice(0, 6));

        const scores = this.aggBy(teamLeaderScore.data, 'team_leader', 'avg').slice(0, 10);
        this.teamLeaderScores.set(scores);
        this.totalLeaderScore.set(scores.reduce((s, r) => s + this.num(r.value), 0));
      },
      error: () => this.error.set('Impossible de charger les données PMA.'),
      complete: () => this.loading.set(false),
    });
  }

  syncing = signal(false);
  syncData(): void {
    this.syncing.set(true);
    this.dataService.triggerEtl().subscribe({
      complete: () => { this.syncing.set(false); this.load(); },
      error:    () => { this.syncing.set(false); this.load(); },
    });
  }

  ngOnDestroy(): void { this.periodSub?.unsubscribe(); }

  percent(value: number, total: number): number {
    return total ? Math.round((value / total) * 100) : 0;
  }

  formatValue(value: unknown): string {
    return this.num(value).toFixed(2);
  }

  num(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private aggBy(rows: KpiDatum[], key: string, method: 'sum' | 'avg'): KpiDatum[] {
    const map = new Map<string, { s: number; n: number }>();
    rows.forEach(r => {
      const k = String(r[key] ?? '');
      const v = this.num(r.value);
      const e = map.get(k) ?? { s: 0, n: 0 };
      map.set(k, { s: e.s + v, n: e.n + 1 });
    });
    return [...map.entries()]
      .map(([k, { s, n }]) => ({ [key]: k, value: method === 'avg' ? s / n : s } as KpiDatum))
      .sort((a, b) => this.num(b.value) - this.num(a.value));
  }

  taskPriorityChart(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.taskPriority().map(x => x.label),
      datasets: [{ label: 'Tâches', data: this.taskPriority().map(x => x.value) }],
    };
  }

  workloadChart(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.filteredWorkload().map(m => String(m['engineer'] ?? 'Unknown')),
      datasets: [{ label: 'Tâches', data: this.filteredWorkload().map(m => this.num(m.value)) }],
    };
  }

  onTimeDeliveryChart(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.onTimeDelivery().map(r => String(r['period'] ?? 'N/A')),
      datasets: [{ label: 'Taux de livraison à temps', data: this.onTimeDelivery().map(r => this.num(r.value)) }],
    };
  }
}
