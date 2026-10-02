import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportConfig } from '../../core/models/reporting.models';
import { ReportConfigService } from '../../core/services/report-config.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

type RunResult = {
  ok: boolean;
  source: string;
  metric: string;
  label: string;
  data?: any;
  error?: string;
};

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './report-view.component.html',
})
export class ReportViewComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  report = signal<ReportConfig | null>(null);
  exporting = signal(false);
  running = signal(false);
  runPayload = signal<any | null>(null);

  constructor(
    private route: ActivatedRoute,
    private reportConfigService: ReportConfigService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing report id.');
      this.loading.set(false);
      return;
    }
    this.reportConfigService.getOne(id).subscribe({
      next: (r) => this.report.set(r),
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to load report details.'),
      complete: () => {
        this.loading.set(false);
        this.runNow();
      },
    });
  }

  runNow(): void {
    const r = this.report();
    if (!r) return;
    this.running.set(true);
    this.error.set(null);
    this.reportConfigService.run(r._id).subscribe({
      next: (payload) => this.runPayload.set(payload),
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to generate report data.'),
      complete: () => this.running.set(false),
    });
  }

  runResults(): RunResult[] {
    return (this.runPayload()?.results ?? []) as RunResult[];
  }

  rowsOf(result: RunResult): Array<Record<string, unknown>> {
    const rows = result?.data?.data;
    return Array.isArray(rows) ? rows : [];
  }

  hasRows(result: RunResult): boolean {
    return this.rowsOf(result).length > 0;
  }

  valueOf(row: Record<string, unknown>): number {
    const n = Number(row['value']);
    return Number.isFinite(n) ? n : 0;
  }

  labelOf(row: Record<string, unknown>): string {
    const keys = Object.keys(row).filter((k) => k !== 'value');
    for (const k of keys) {
      const v = row[k];
      if (typeof v === 'string' && v.trim()) return v;
      if (v !== null && v !== undefined) return String(v);
    }
    return 'Item';
  }

  sumValues(result: RunResult): number {
    return this.rowsOf(result).reduce((s, r) => s + this.valueOf(r), 0);
  }

  maxValue(result: RunResult): number {
    return Math.max(1, ...this.rowsOf(result).map((r) => this.valueOf(r)));
  }

  barWidth(value: number, max: number): number {
    if (!max) return 0;
    return Math.max(4, Math.round((value / max) * 100));
  }

  comparisonRate(result: RunResult): number | null {
    const rate = result?.data?.comparison?.delta_rate;
    return typeof rate === 'number' && Number.isFinite(rate) ? rate : null;
  }

  comparisonLabel(result: RunResult): string {
    const rate = this.comparisonRate(result);
    if (rate === null) return 'No comparison window';
    const sign = rate >= 0 ? '+' : '-';
    return `${sign}${Math.abs(rate * 100).toFixed(1)}% vs previous`;
  }

  resultChartData(result: RunResult): ChartConfiguration<'bar'>['data'] {
    const rows = this.rowsOf(result).slice(0, 8);
    return {
      labels: rows.map((row) => this.labelOf(row)),
      datasets: [{ label: result.label || result.metric, data: rows.map((row) => this.valueOf(row)) }],
    };
  }

  download(format: 'pdf' | 'xlsx' | 'json'): void {
    const r = this.report();
    if (!r) return;
    this.exporting.set(true);
    this.reportConfigService.export(r._id, format).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${r.name || 'report'}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to export report.'),
      complete: () => this.exporting.set(false),
    });
  }
}
