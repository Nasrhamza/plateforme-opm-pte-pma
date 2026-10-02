import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalPeriodService, GlobalPeriodState } from '../../../core/services/global-period.service';
import { ReportPeriod } from '../../../core/models/reporting.models';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap items-center gap-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-5 py-3 mb-8 shadow-sm">
      <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mr-1">Filtrer</span>

      <!-- All -->
      <button type="button" (click)="applyAll()"
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
        [class.bg-primary]="isAll()" [class.text-white]="isAll()"
        [class.bg-surface-container]="!isAll()" [class.text-on-surface-variant]="!isAll()">
        Toute la période
      </button>

      <div class="w-px h-5 bg-outline-variant/40"></div>

      <!-- Date range -->
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Du</span>
        <input type="date" [(ngModel)]="dateFrom" (ngModelChange)="onFromChange($event)"
          class="text-xs border border-outline-variant/30 rounded-lg px-3 py-1.5 bg-surface text-on-surface
                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
        <span class="text-on-surface-variant text-xs">→</span>
        <input type="date" [(ngModel)]="dateTo" (ngModelChange)="onToChange($event)"
          class="text-xs border border-outline-variant/30 rounded-lg px-3 py-1.5 bg-surface text-on-surface
                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
      </div>

      <!-- Active badge -->
      @if (!isAll()) {
        <div class="flex items-center gap-2 ml-auto">
          <span class="material-symbols-outlined text-primary text-sm">filter_alt</span>
          <span class="text-xs font-semibold text-primary">
            {{ activeDateFrom() }} – {{ activeDateTo() }}
          </span>
          <button type="button" (click)="applyAll()"
            class="text-on-surface-variant hover:text-error transition-colors ml-1"
            title="Effacer le filtre">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class FilterBarComponent {
  dateFrom = '';
  dateTo   = '';

  readonly periodService = inject(GlobalPeriodService);

  private stateSignal = toSignal(this.periodService.state$, {
    initialValue: { period: 'all' } as GlobalPeriodState,
  });

  isAll(): boolean {
    return this.stateSignal().period === 'all';
  }

  activeDateFrom(): string {
    return this.stateSignal().dateFrom?.slice(0, 10) ?? '';
  }

  activeDateTo(): string {
    return this.stateSignal().dateTo?.slice(0, 10) ?? '';
  }

  applyAll(): void {
    this.dateFrom = '';
    this.dateTo   = '';
    this.periodService.setAll();
  }

  onFromChange(value: string): void {
    this.dateFrom = value;
    this.tryApply();
  }

  onToChange(value: string): void {
    this.dateTo = value;
    this.tryApply();
  }

  private tryApply(): void {
    if (this.dateFrom && this.dateTo) {
      this.periodService.setRange(this.dateFrom, this.dateTo);
    }
  }
}
