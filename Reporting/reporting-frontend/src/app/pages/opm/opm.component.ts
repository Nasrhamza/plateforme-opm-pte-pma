import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { KpiDatum } from '../../core/models/reporting.models';
import { GlobalPeriodService } from '../../core/services/global-period.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';

type StatusSlice = { label: string; value: number; colorClass: string };

@Component({
  selector: 'app-opm',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FilterBarComponent],
  templateUrl: './opm.component.html',
})
export class OpmComponent implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);

  totalTickets = signal(0);
  openTickets = signal(0);
  resolvedTickets = signal(0);
  breachedTickets = signal(0);
  avgResolutionHours = signal(0);
  avgMtta = signal(0);
  avgSlaCompliance = signal(0);

  openedSeries = signal<KpiDatum[]>([]);
  topTechnicians = signal<KpiDatum[]>([]);
  statusDistribution = signal<StatusSlice[]>([]);
  mttrByContract = signal<KpiDatum[]>([]);
  private periodSub?: Subscription;

  resolutionHours = computed(() => this.avgResolutionHours().toFixed(1));

  // Entity filters
  filterTechnician = signal('');
  filterContract   = signal('');

  technicianOptions = computed(() =>
    [...new Set(this.topTechnicians().map(r => String(r['technician'] ?? '')))].filter(Boolean)
  );
  contractOptions = computed(() =>
    [...new Set(this.mttrByContract().map(r => String(r['contract'] ?? '')))].filter(Boolean)
  );

  filteredTechnicians = computed(() => {
    const t = this.filterTechnician();
    return t ? this.topTechnicians().filter(r => String(r['technician'] ?? '') === t) : this.topTechnicians();
  });
  filteredMttr = computed(() => {
    const c = this.filterContract();
    return c ? this.mttrByContract().filter(r => String(r['contract'] ?? '') === c) : this.mttrByContract();
  });

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
    this.filterTechnician.set('');
    this.filterContract.set('');
    const filters = this.periodService.currentFilters();

    forkJoin({
      byStatus: this.dataService.getOpmTicketsByStatus(filters),
      byPeriod: this.dataService.getOpmFirstCallResolution(filters),
      byTech: this.dataService.getOpmTechnicianLoad(filters),
      sla: this.dataService.getOpmSlaCompliance(filters),
      contractHealth: this.dataService.getOpmContractHealth(filters),
      mttr: this.dataService.getOpmMttr(filters),
      mtta: this.dataService.getOpmMtta(filters),
    }).subscribe({
      next: ({ byStatus, byPeriod, byTech, sla, contractHealth, mttr, mtta }) => {
        const statusAgg = new Map<string, number>();
        byStatus.data.forEach(row => {
          const s = String(row['status'] ?? 'Unknown');
          statusAgg.set(s, (statusAgg.get(s) ?? 0) + this.num(row.value));
        });
        const statuses = [...statusAgg.entries()].map(([status, value]) => ({ status, value }));
        const total = statuses.reduce((sum, item) => sum + item.value, 0);
        this.totalTickets.set(total);
        this.openTickets.set(statuses.filter(s => !s.status.toLowerCase().includes('closed')).reduce((s, i) => s + i.value, 0));
        this.resolvedTickets.set(statuses.filter(s => s.status.toLowerCase().includes('closed') || s.status.toLowerCase().includes('resolved')).reduce((s, i) => s + i.value, 0));
        const contractHealthAgg = this.aggBy(contractHealth.data, 'contract', 'avg');
        this.breachedTickets.set(contractHealthAgg.filter(item => this.num(item.value) < 100).length);

        const slaByContract = new Map<string, number>();
        sla.data.forEach(row => {
          const c = String(row['contract'] ?? '');
          slaByContract.set(c, (slaByContract.get(c) ?? 0) + this.num(row.value));
        });
        this.avgSlaCompliance.set(slaByContract.size ? [...slaByContract.values()].reduce((s, v) => s + v, 0) / slaByContract.size : 0);

        const mttrAgg = this.aggBy(mttr.data, 'contract', 'avg');
        const mttrVals = mttrAgg.map(r => this.num(r.value));
        this.avgResolutionHours.set(mttrVals.length ? mttrVals.reduce((s, v) => s + v, 0) / mttrVals.length : 0);
        this.mttrByContract.set(mttrAgg.slice(0, 15));

        const mttaAgg = this.aggBy(mtta.data, 'contract', 'avg');
        const mttaVals = mttaAgg.map(r => this.num(r.value));
        this.avgMtta.set(mttaVals.length ? mttaVals.reduce((s, v) => s + v, 0) / mttaVals.length : 0);

        this.openedSeries.set(byPeriod.data.slice(0, 6));
        this.topTechnicians.set(this.aggBy(byTech.data, 'technician', 'sum').slice(0, 10));
        const colors = ['bg-primary', 'bg-secondary', 'bg-orange-500', 'bg-slate-400'];
        this.statusDistribution.set(
          statuses.slice(0, 4).map((item, idx) => ({ label: item.status, value: item.value, colorClass: colors[idx] ?? 'bg-slate-400' }))
        );
      },
      error: () => this.error.set('Impossible de charger les données OPM.'),
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

  percent(part: number): number {
    const total = this.totalTickets();
    return total ? Math.round((part / total) * 100) : 0;
  }

  volumeByPeriodData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.openedSeries().map(i => String(i['period'] ?? 'N/A')),
      datasets: [{ label: 'Taux de résolution au 1er contact', data: this.openedSeries().map(i => this.num(i.value)) }],
    };
  }

  statusDistributionData(): ChartConfiguration<'doughnut'>['data'] {
    return {
      labels: this.statusDistribution().map(s => s.label),
      datasets: [{ data: this.statusDistribution().map(s => s.value) }],
    };
  }

  techniciansData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.filteredTechnicians().map(t => String(t['technician'] ?? 'Unknown')),
      datasets: [{ label: 'Charge tickets', data: this.filteredTechnicians().map(t => this.num(t.value)) }],
    };
  }

  private num(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
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
}
