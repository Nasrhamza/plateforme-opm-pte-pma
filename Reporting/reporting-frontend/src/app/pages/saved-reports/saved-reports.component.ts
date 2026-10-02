import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReportConfig, ReportConfigPayload } from '../../core/models/reporting.models';
import { ReportConfigService } from '../../core/services/report-config.service';

@Component({
  selector: 'app-saved-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './saved-reports.component.html',
})
export class SavedReportsComponent implements OnInit {
  loading = signal(true);
  deletingId = signal<string | null>(null);
  savingId = signal<string | null>(null);
  error = signal<string | null>(null);
  query = signal('');
  page = signal(1);
  limit = signal(9);
  total = signal(0);
  reports = signal<ReportConfig[]>([]);

  constructor(
    private reportConfigService: ReportConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reportConfigService.list(this.page(), this.limit(), this.query()).subscribe({
      next: (res) => {
        this.reports.set(res.items);
        this.total.set(res.total);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to load saved reports.'),
      complete: () => this.loading.set(false),
    });
  }

  setQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
    this.load();
  }

  nextPage(): void {
    const maxPage = this.totalPages();
    if (this.page() < maxPage) {
      this.page.update((v) => v + 1);
      this.load();
    }
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((v) => v - 1);
      this.load();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.limit()));
  }

  goToBuilder(): void {
    this.router.navigateByUrl('/report-builder');
  }

  toggleSchedule(report: ReportConfig): void {
    const payload: Partial<ReportConfigPayload> = {
      schedule: {
        ...(report.schedule ?? { recipients: [] }),
        enabled: !report.schedule.enabled,
      },
    };
    this.savingId.set(report._id);
    this.reportConfigService.update(report._id, payload).subscribe({
      next: (updated) => {
        this.reports.update((list) => list.map((r) => (r._id === updated._id ? updated : r)));
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to update report schedule.'),
      complete: () => this.savingId.set(null),
    });
  }

  deleteReport(report: ReportConfig): void {
    this.deletingId.set(report._id);
    this.reportConfigService.remove(report._id).subscribe({
      next: () => this.reports.update((list) => list.filter((r) => r._id !== report._id)),
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to delete report.'),
      complete: () => this.deletingId.set(null),
    });
  }

  sourceClass(source: string): string {
    if (source === 'OPM') return 'bg-error-container text-error';
    if (source === 'PTE') return 'bg-[#fff4e5] text-[#ffae1f]';
    return 'bg-primary-fixed text-primary';
  }

  scheduleLabel(report: ReportConfig): string {
    if (!report.schedule?.enabled) return 'No automated schedule set';
    const f = report.schedule.frequency ?? 'custom';
    return `Schedules: ${f[0].toUpperCase()}${f.slice(1)}`;
  }
}
