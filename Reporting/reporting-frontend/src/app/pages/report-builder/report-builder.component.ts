import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { ReportConfigService } from '../../core/services/report-config.service';
import { KpiDatum, MetadataOptions, ReportConfig, ReportConfigPayload, ReportFrequency, ReportPeriod, ReportSource } from '../../core/models/reporting.models';
import { FormControl, FormGroup } from '@angular/forms';

type KpiGroup = {
  key: ReportSource;
  label: string;
  description: string;
  selected: boolean;
  metrics: { metric: string; label: string }[];
};

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-builder.component.html',
})
export class ReportBuilderComponent implements OnInit {
  saving = signal(false);
  loadingPreview = signal(true);
  loadingConfig = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  editingId = signal<string | null>(null);
  metadata = signal<MetadataOptions>({ departments: [], clients: [], contracts: [], periods: ['all', 'range'] });

  opmPreview = signal<KpiDatum[]>([]);
  pmaPreview = signal<KpiDatum[]>([]);
  ptePreview = signal<KpiDatum[]>([]);

  kpiGroups = signal<KpiGroup[]>([
    {
      key: 'OPM',
      label: 'OPM',
      description: 'Operational Performance Metrics',
      selected: true,
      metrics: [
        { metric: 'tickets_by_status', label: 'Tickets by Status' },
        { metric: 'resolution_rate', label: 'Resolution Rate' },
      ],
    },
    {
      key: 'PTE',
      label: 'PTE',
      description: 'People & Transport Efficiency',
      selected: false,
      metrics: [
        { metric: 'leaves_by_type', label: 'Leaves by Type' },
        { metric: 'missions', label: 'Missions' },
      ],
    },
    {
      key: 'PMA',
      label: 'PMA',
      description: 'Project Management Analytics',
      selected: true,
      metrics: [
        { metric: 'projects_by_status', label: 'Projects by Status' },
        { metric: 'workload', label: 'Workload' },
      ],
    },
  ]);

  // Selected KPI metrics per source group (e.g. { OPM: Set('tickets_by_status') })
  selectedMetrics = signal<Record<ReportSource, Set<string>>>({
    OPM: new Set(['tickets_by_status', 'resolution_rate']),
    PTE: new Set([]),
    PMA: new Set(['projects_by_status', 'workload']),
  });

  form!: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    dateFrom: FormControl<string>;
    dateTo: FormControl<string>;
    department: FormControl<string>;
    client: FormControl<string>;
    scheduleEnabled: FormControl<boolean>;
    frequency: FormControl<ReportFrequency>;
    format: FormControl<string>;
    recipients: FormControl<string>;
  }>;

  selectedCount = computed(() => this.kpiGroups().filter((g) => g.selected).length);

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private reportConfigService: ReportConfigService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dateFrom: [''],
      dateTo: [''],
      department: ['Operations'],
      client: ['All Clients'],
      scheduleEnabled: [true],
      frequency: ['weekly' as ReportFrequency],
      format: ['pdf'],
      recipients: ['saharbouhjar14@gmail.com'],
    });
  }

  ngOnInit(): void {
    this.loadPreview();
    this.loadMetadata();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(id);
      this.loadExisting(id);
    }
  }

  loadMetadata(): void {
    this.dataService.getMetadataOptions().subscribe({
      next: (meta) => this.metadata.set(meta),
      error: () => {
        // keep sane defaults when metadata endpoint has no data yet
      },
    });
  }

  toggleGroup(key: ReportSource): void {
    const nextSelected = !this.kpiGroups().find((g) => g.key === key)?.selected;
    this.kpiGroups.update((groups) =>
      groups.map((g) => (g.key === key ? { ...g, selected: nextSelected } : g))
    );

    const group = this.kpiGroups().find((g) => g.key === key);
    if (!group) return;

    this.selectedMetrics.update((curr) => {
      const next = { ...curr };
      next[key] = new Set(next[key] ?? []);
      if (nextSelected) {
        // default-select all metrics in that group when enabled
        group.metrics.forEach((m) => next[key].add(m.metric));
      } else {
        // clear metrics when group disabled
        next[key].clear();
      }
      return next;
    });
  }

  isMetricSelected(source: ReportSource, metric: string): boolean {
    return this.selectedMetrics()?.[source]?.has(metric) ?? false;
  }

  toggleMetric(source: ReportSource, metric: string): void {
    this.selectedMetrics.update((curr) => {
      const next = { ...curr };
      next[source] = new Set(next[source] ?? []);
      if (next[source].has(metric)) next[source].delete(metric);
      else next[source].add(metric);
      return next;
    });
  }

  loadPreview(): void {
    this.loadingPreview.set(true);
    forkJoin({
      opm: this.dataService.getOpmTicketsByStatus(),
      pma: this.dataService.getPmaPortfolioStatus(),
      pte: this.dataService.getPteLeaveConsumption(),
    }).subscribe({
      next: ({ opm, pma, pte }) => {
        this.opmPreview.set(opm.data.slice(0, 6));
        this.pmaPreview.set(pma.data.slice(0, 6));
        this.ptePreview.set(pte.data.slice(0, 6));
      },
      error: () => this.errorMessage.set('Unable to load live preview widgets.'),
      complete: () => this.loadingPreview.set(false),
    });
  }

  private loadExisting(id: string): void {
    this.loadingConfig.set(true);
    this.reportConfigService.getOne(id).subscribe({
      next: (report) => this.hydrateFromConfig(report),
      error: (err) => this.errorMessage.set(err?.error?.message ?? 'Unable to load report for editing.'),
      complete: () => this.loadingConfig.set(false),
    });
  }

  private hydrateFromConfig(report: ReportConfig): void {
    this.form.patchValue({
      name: report.name,
      description: report.description ?? '',
      dateFrom: report.filters?.dateFrom ?? '',
      dateTo: report.filters?.dateTo ?? '',
      department: report.filters?.departments?.[0] ?? 'Operations',
      client: report.filters?.clients?.[0] ?? 'All Clients',
      scheduleEnabled: report.schedule?.enabled ?? false,
      frequency: report.schedule?.frequency ?? 'weekly',
      format: report.schedule?.format ?? 'pdf',
      recipients: (report.schedule?.recipients ?? []).join(', '),
    });

    const enabled = new Set(report.kpis.map((k) => k.source));
    this.kpiGroups.update((groups) => groups.map((g) => ({ ...g, selected: enabled.has(g.key) })));

    // hydrate selected KPI metrics
    const selectedBySource: Record<ReportSource, Set<string>> = {
      OPM: new Set(),
      PTE: new Set(),
      PMA: new Set(),
    };
    report.kpis.forEach((k) => selectedBySource[k.source].add(k.metric));
    this.selectedMetrics.set(selectedBySource);
  }

  saveReport(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const selectedGroups = this.kpiGroups().filter((group) => group.selected);
    if (selectedGroups.length === 0) {
      this.errorMessage.set('Select at least one KPI group.');
      return;
    }

    const selectedKpis = selectedGroups.flatMap((group) => {
      const chosen = this.selectedMetrics()?.[group.key] ?? new Set();
      return group.metrics
        .filter((m) => chosen.has(m.metric))
        .map((m) => ({ source: group.key, metric: m.metric, label: m.label }));
    });

    if (selectedKpis.length === 0) {
      this.errorMessage.set('Select at least one KPI from the enabled groups.');
      return;
    }

    const dateFrom = this.form.controls['dateFrom'].value;
    const dateTo   = this.form.controls['dateTo'].value;
    const payload: ReportConfigPayload = {
      name: this.form.controls['name'].value,
      description: this.form.controls['description'].value,
      kpis: selectedKpis,
      filters: {
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo   ? { dateTo }   : {}),
        departments: [this.form.controls['department'].value],
        clients: [this.form.controls['client'].value],
      },
      schedule: {
        enabled: this.form.controls['scheduleEnabled'].value,
        frequency: this.form.controls['scheduleEnabled'].value ? this.form.controls['frequency'].value : undefined,
        format: this.form.controls['format'].value as 'pdf' | 'xlsx' | 'json',
        recipients: this.form.controls['recipients'].value
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean),
      },
      isActive: true,
    };

    this.saving.set(true);
    const req$ = this.editingId()
      ? this.reportConfigService.update(this.editingId()!, payload)
      : this.reportConfigService.create(payload);

    req$.subscribe({
      next: () => {
        this.reportConfigService.refreshScheduler().subscribe({ next: () => {}, error: () => {} });
        this.successMessage.set(this.editingId() ? 'Report configuration updated successfully.' : 'Report configuration saved successfully.');
        if (!this.editingId()) {
          this.form.patchValue({ name: '', description: '' });
        } else {
          this.router.navigateByUrl('/saved-reports');
        }
      },
      error: (err) => this.errorMessage.set(err?.error?.message ?? 'Failed to save report configuration.'),
      complete: () => this.saving.set(false),
    });
  }
}
