import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { KpiDatum, KpiResponse } from '../../core/models/reporting.models';
import { GlobalPeriodService } from '../../core/services/global-period.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FilterBarComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);

  // OPM / PTE / PMA KPIs
  opmOpenTickets = signal(0);
  opmResolutionRate = signal(0);
  ptePendingLeaves = signal(0);
  pteMissions = signal(0);
  pmaActiveProjects = signal(0);
  pmaOverdueTasks = signal(0);
  trends = signal<Record<string, number | null>>({});

  opmStatus = signal<KpiDatum[]>([]);
  pmaStatus = signal<KpiDatum[]>([]);
  pteLeaves = signal<KpiDatum[]>([]);
  opmPeriods = signal<KpiDatum[]>([]);
  pmaWorkload = signal<KpiDatum[]>([]);

  // Exec KPIs
  execRevenueAtRisk = signal(0);
  execCompanyThroughput = signal(0);
  execActiveClients = signal(0);
  execAvgWorkforceAvail = signal(0);
  execAvgPmScore = signal(0);
  execThroughputSeries = signal<KpiDatum[]>([]);
  execClientHealthData = signal<KpiDatum[]>([]);
  execWorkforceSeries = signal<KpiDatum[]>([]);

  private periodSub?: Subscription;

  constructor(
    private dataService: DataService,
    private periodService: GlobalPeriodService
  ) {}

  syncing = signal(false);

  syncData(): void {
    this.syncing.set(true);
    this.dataService.triggerEtl().subscribe({
      complete: () => { this.syncing.set(false); this.load(); },
      error:    () => { this.syncing.set(false); this.load(); },
    });
  }

  ngOnInit(): void {
    this.periodSub = this.periodService.state$.subscribe(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const filters = this.periodService.currentFilters();

    const empty = (metric: string): KpiResponse => ({
      metric, dimensions: [], filters: {}, period: '', data: [],
      generatedAt: '', freshness: { source: '', strategy: '' },
    });
    const safe = (obs: ReturnType<DataService['getOpmTicketsByStatus']>, metric: string) =>
      obs.pipe(catchError(() => of(empty(metric))));

    forkJoin({
      opmByStatus: safe(this.dataService.getOpmTicketsByStatus(filters), 'opm.tickets_by_status'),
      opmResRate:  safe(this.dataService.getOpmFirstCallResolution(filters), 'opm.first_call_resolution'),
      opmByPeriod: safe(this.dataService.getOpmFirstCallResolution(filters), 'opm.first_call_resolution'),
      pteByType:   safe(this.dataService.getPteLeaveConsumption(filters), 'pte.leave_consumption'),
      pteMissions: safe(this.dataService.getPteInterventionThroughput(filters), 'pte.intervention_throughput'),
      pmaByStatus: safe(this.dataService.getPmaPortfolioStatus(filters), 'pma.portfolio_status'),
      pmaOverdue:  safe(this.dataService.getPmaOverdueIndex(filters), 'pma.overdue_index'),
      pmaWorkload: safe(this.dataService.getPmaEngineerProductivity(filters), 'pma.engineer_productivity'),
      execThroughput: safe(this.dataService.getExecCompanyThroughput(filters), 'exec.company_throughput'),
      execPmScore:    safe(this.dataService.getExecPmScorecard(filters), 'exec.pm_scorecard'),
      execRevRisk:    safe(this.dataService.getExecRevenueAtRisk(filters), 'exec.revenue_at_risk'),
      execClients:    safe(this.dataService.getExecClientHealth(filters), 'exec.client_health'),
      execWorkforce:  safe(this.dataService.getExecWorkforceAvailability(filters), 'exec.workforce_availability'),
    }).subscribe({
      next: ({
        opmByStatus, opmResRate, opmByPeriod,
        pteByType, pteMissions,
        pmaByStatus, pmaOverdue, pmaWorkload,
        execThroughput, execPmScore, execRevRisk, execClients, execWorkforce,
      }) => {
        this.opmStatus.set(opmByStatus.data);
        this.opmPeriods.set(opmByPeriod.data.slice(0, 3));
        this.pteLeaves.set(pteByType.data.slice(0, 6));
        this.pmaStatus.set(pmaByStatus.data);
        this.pmaWorkload.set(this.aggBy(pmaWorkload.data, 'engineer', 'sum').slice(0, 3));

        this.opmOpenTickets.set(this.sumExcluded(opmByStatus.data, 'status', 'closed'));
        this.opmResolutionRate.set(this.avg(opmResRate.data));
        this.ptePendingLeaves.set(this.sum(pteByType.data));
        this.pteMissions.set(this.sum(pteMissions.data));
        this.pmaActiveProjects.set(this.sumFiltered(pmaByStatus.data, 'status', 'progress'));
        this.pmaOverdueTasks.set(Math.round(this.avg(pmaOverdue.data)));

        this.trends.set({
          opmOpenTickets: this.deltaRate(opmByStatus),
          opmResolutionRate: this.deltaRate(opmResRate),
          ptePendingLeaves: this.deltaRate(pteByType),
          pteMissions: this.deltaRate(pteMissions),
          pmaActiveProjects: this.deltaRate(pmaByStatus),
          pmaOverdueTasks: this.deltaRate(pmaOverdue),
        });

        // Exec
        this.execRevenueAtRisk.set(this.sum(execRevRisk.data));
        this.execCompanyThroughput.set(this.sum(execThroughput.data));
        this.execActiveClients.set(execClients.data.length);
        this.execAvgWorkforceAvail.set(this.avg(execWorkforce.data));
        const pmAgg = this.aggBy(execPmScore.data, 'team_leader', 'avg');
        this.execAvgPmScore.set(pmAgg.length ? pmAgg.reduce((s, r) => s + this.n(r.value), 0) / pmAgg.length : 0);
        this.execThroughputSeries.set(execThroughput.data.slice(0, 8));
        this.execClientHealthData.set(this.aggBy(execClients.data, 'client', 'avg').slice(0, 8));
        this.execWorkforceSeries.set(execWorkforce.data.slice(0, 6));
      },
      error: () => this.error.set('Impossible de charger les données du tableau de bord.'),
      complete: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    this.periodSub?.unsubscribe();
  }

  max(rows: KpiDatum[]): number {
    return Math.max(1, ...rows.map((r) => this.n(r.value)));
  }

  pct(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  statusPieData(): ChartConfiguration<'pie'>['data'] {
    return {
      labels: this.opmStatus().map((r) => String(r['status'] ?? 'Unknown')),
      datasets: [{ data: this.opmStatus().map((r) => this.n(r.value)) }],
    };
  }

  pmaBarData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.pmaStatus().map((r) => String(r['status'] ?? 'Unknown')),
      datasets: [{ data: this.pmaStatus().map((r) => this.n(r.value)), label: 'Projects' }],
    };
  }

  leavesDoughnutData(): ChartConfiguration<'doughnut'>['data'] {
    return {
      labels: this.pteLeaves().map((r) => String(r['leave_type'] ?? 'Unknown')),
      datasets: [{ data: this.pteLeaves().map((r) => this.n(r.value)) }],
    };
  }

  opmLineData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.opmPeriods().map((r) => String(r['period'] ?? 'N/A')),
      datasets: [{ data: this.opmPeriods().map((r) => this.n(r.value)), label: 'FCR Rate' }],
    };
  }

  workloadBarData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.pmaWorkload().map((r) => String(r['engineer'] ?? 'Unknown')),
      datasets: [{ data: this.pmaWorkload().map((r) => this.n(r.value)), label: 'Tasks' }],
    };
  }

  throughputLineData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.execThroughputSeries().map((r) => String(r['period'] ?? 'N/A')),
      datasets: [{ data: this.execThroughputSeries().map((r) => this.n(r.value)), label: 'Débit' }],
    };
  }

  clientHealthBarData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.execClientHealthData().map((r) => String(r['client'] ?? 'Unknown')),
      datasets: [{ data: this.execClientHealthData().map((r) => this.n(r.value)), label: 'Score santé' }],
    };
  }

  workforceBarData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.execWorkforceSeries().map((r) => String(r['department'] ?? 'Unknown')),
      datasets: [{ data: this.execWorkforceSeries().map((r) => this.n(r.value)), label: 'Disponibilité %' }],
    };
  }

  trendOf(key: string): number | null {
    return this.trends()[key] ?? null;
  }

  trendLabel(key: string): string {
    const rate = this.trendOf(key);
    if (rate === null || !Number.isFinite(rate)) return 'Pas de période de comparaison';
    const percent = Math.abs(rate * 100).toFixed(1);
    const direction = rate >= 0 ? '+' : '-';
    return `${direction}${percent}% vs période préc.`;
  }

  private sum(rows: KpiDatum[]): number {
    return rows.reduce((s, r) => s + this.n(r.value), 0);
  }

  private deltaRate(response: KpiResponse): number | null {
    return response.comparison?.delta_rate ?? null;
  }

  private avg(rows: KpiDatum[]): number {
    return rows.length ? this.sum(rows) / rows.length : 0;
  }

  private sumFiltered(rows: KpiDatum[], key: string, needle: string): number {
    return rows
      .filter((r) => String(r[key] ?? '').toLowerCase().includes(needle))
      .reduce((s, r) => s + this.n(r.value), 0);
  }

  private sumExcluded(rows: KpiDatum[], key: string, needle: string): number {
    return rows
      .filter((r) => !String(r[key] ?? '').toLowerCase().includes(needle))
      .reduce((s, r) => s + this.n(r.value), 0);
  }

  private n(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  private aggBy(rows: KpiDatum[], key: string, method: 'sum' | 'avg'): KpiDatum[] {
    const map = new Map<string, { s: number; n: number }>();
    rows.forEach(r => {
      const k = String(r[key] ?? '');
      const v = this.n(r.value);
      const e = map.get(k) ?? { s: 0, n: 0 };
      map.set(k, { s: e.s + v, n: e.n + 1 });
    });
    return [...map.entries()]
      .map(([k, { s, n }]) => ({ [key]: k, value: method === 'avg' ? s / n : s } as KpiDatum))
      .sort((a, b) => this.n(b.value) - this.n(a.value));
  }
}
