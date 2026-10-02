import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GlobalPeriodService } from '../../core/services/global-period.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  dateFrom = signal('');
  dateTo   = signal('');

  constructor(
    public auth: AuthService,
    public periodService: GlobalPeriodService,
  ) {}

  get isAll(): boolean {
    return this.periodService.state.period === 'all';
  }

  applyAll(): void {
    this.dateFrom.set('');
    this.dateTo.set('');
    this.periodService.setAll();
  }

  applyRange(): void {
    const from = this.dateFrom();
    const to   = this.dateTo();
    if (!from || !to) return;
    this.periodService.setRange(from, to);
  }

  logout(): void {
    this.auth.logout();
  }
}
