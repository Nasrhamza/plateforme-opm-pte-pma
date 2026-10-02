import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { KpiDatum } from '../../core/models/reporting.models';
import { GlobalPeriodService } from '../../core/services/global-period.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';

@Component({
  selector: 'app-pte',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FilterBarComponent],
  templateUrl: './pte.component.html',
})
export class PteComponent implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);

  headcount      = signal(0);
  approvedLeave  = signal(0);
  fieldTrips     = signal(0);
  missionsCount  = signal(0);

  leavesRaw      = signal<KpiDatum[]>([]);
  vehicleUsage   = signal<KpiDatum[]>([]);
  missions       = signal<KpiDatum[]>([]);
  private periodSub?: Subscription;

  // Entity filters
  filterDept     = signal('');
  filterEngineer = signal('');

  deptOptions = computed(() =>
    [...new Set(this.leavesRaw().map(r => String(r['department'] ?? '')))].filter(v => v && v !== 'Unknown').sort()
  );
  engineerOptions = computed(() =>
    [...new Set(this.missions().map(r => String(r['engineer'] ?? '')))].filter(Boolean).sort()
  );

  filteredLeavesByType = computed(() => {
    const dept = this.filterDept();
    const rows = dept ? this.leavesRaw().filter(r => String(r['department'] ?? '') === dept) : this.leavesRaw();
    const agg = new Map<string, number>();
    rows.forEach(row => {
      const t = String(row['leave_type'] ?? 'OTHER');
      agg.set(t, (agg.get(t) ?? 0) + this.num(row.value));
    });
    return [...agg.entries()].map(([leave_type, value]) => ({ leave_type, value } as KpiDatum));
  });

  filteredLeavesByDept = computed(() => {
    const dept = this.filterDept();
    const agg = new Map<string, number>();
    const rows = dept ? this.leavesRaw().filter(r => String(r['department'] ?? '') === dept) : this.leavesRaw();
    rows.forEach(row => {
      const d = String(row['department'] ?? 'Unknown');
      agg.set(d, (agg.get(d) ?? 0) + this.num(row.value));
    });
    return [...agg.entries()].map(([department, value]) => ({ department, value } as KpiDatum));
  });

  filteredMissions = computed(() => {
    const eng = this.filterEngineer();
    return eng ? this.missions().filter(r => String(r['engineer'] ?? '') === eng) : this.missions();
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
    this.filterDept.set('');
    this.filterEngineer.set('');
    const filters = this.periodService.currentFilters();

    forkJoin({
      leaves:          this.dataService.getPteLeaveConsumption(filters),
      vehicles:        this.dataService.getPteVehicleUtilization(filters),
      interventions:   this.dataService.getPteInterventionThroughput(filters),
      headcount:       this.dataService.getPteHeadcount(filters),
    }).subscribe({
      next: ({ leaves, vehicles, interventions, headcount }) => {
        this.leavesRaw.set(leaves.data);
        const vehicleAgg = this.aggBy(vehicles.data, 'vehicle', 'sum');
        this.vehicleUsage.set(vehicleAgg.slice(0, 10));
        this.missions.set(interventions.data.slice(0, 15));

        this.headcount.set(headcount.data.reduce((s, i) => s + this.num(i.value), 0));
        this.approvedLeave.set(leaves.data.reduce((s, i) => s + this.num(i.value), 0));
        this.missionsCount.set(interventions.data.reduce((s, i) => s + this.num(i.value), 0));
        this.fieldTrips.set(vehicleAgg.length);
      },
      error: () => this.error.set('Impossible de charger les données PTE.'),
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

  maxValue(rows: KpiDatum[]): number {
    return Math.max(1, ...rows.map(r => this.num(r.value)));
  }

  toPercent(value: number, max: number): number {
    return Math.max(4, Math.round((value / Math.max(1, max)) * 100));
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

  leavesByTypeChart(): ChartConfiguration<'bar'>['data'] {
    const rows = this.filteredLeavesByType();
    return {
      labels: rows.map(i => String((i as any)['leave_type'] ?? 'Unknown')),
      datasets: [{ label: 'Jours de congé', data: rows.map(i => this.num(i.value)) }],
    };
  }

  leavesByDepartmentChart(): ChartConfiguration<'doughnut'>['data'] {
    const rows = this.filteredLeavesByDept();
    return {
      labels: rows.map(i => String((i as any)['department'] ?? 'Unknown')),
      datasets: [{ data: rows.map(i => this.num(i.value)) }],
    };
  }
}
