import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpmFilters, ReportPeriod } from '../models/reporting.models';

export type GlobalPeriodState = {
  period: ReportPeriod;
  dateFrom?: string;
  dateTo?: string;
};

@Injectable({ providedIn: 'root' })
export class GlobalPeriodService {
  private readonly stateSubject = new BehaviorSubject<GlobalPeriodState>({
    period: 'all',
  });

  readonly state$ = this.stateSubject.asObservable();

  get state(): GlobalPeriodState {
    return this.stateSubject.value;
  }

  currentFilters(): OpmFilters {
    const { dateFrom, dateTo } = this.stateSubject.value;
    return { dateFrom, dateTo };
  }

  setAll(): void {
    this.stateSubject.next({ period: 'all' });
  }

  setRange(dateFrom: string, dateTo: string): void {
    this.stateSubject.next({ period: 'range', dateFrom, dateTo });
  }

  // kept for backward compat with any remaining callers
  setPeriod(period: ReportPeriod): void {
    if (period === 'all') this.setAll();
  }
}
