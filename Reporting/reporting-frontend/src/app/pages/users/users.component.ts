import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagedUser } from '../../core/models/reporting.models';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  query = signal('');
  users = signal<ManagedUser[]>([]);
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  updatingId = signal<string | null>(null);
  deletingId = signal<string | null>(null);
  creating = signal(false);
  createPanelOpen = signal(false);
  draftFullName = signal('');
  draftEmail = signal('');
  draftPassword = signal('');
  draftRole = signal<'admin' | 'viewer'>('viewer');
  exporting = signal(false);

  filteredUsers = computed(() => this.users());

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.usersService.list(this.page(), this.limit(), this.query()).subscribe({
      next: (res) => {
        this.users.set(res.items);
        this.total.set(res.total);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to load users.'),
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

  toggleStatus(user: ManagedUser): void {
    this.updatingId.set(user._id);
    this.usersService.update(user._id, { isEnabled: !user.isEnabled }).subscribe({
      next: (updated) => this.users.update((list) => list.map((u) => (u._id === updated._id ? updated : u))),
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to update user status.'),
      complete: () => this.updatingId.set(null),
    });
  }

  toggleRole(user: ManagedUser): void {
    const nextRole = user.role === 'admin' ? 'viewer' : 'admin';
    this.updatingId.set(user._id);
    this.usersService.update(user._id, { role: nextRole }).subscribe({
      next: (updated) => this.users.update((list) => list.map((u) => (u._id === updated._id ? updated : u))),
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to update user role.'),
      complete: () => this.updatingId.set(null),
    });
  }

  deleteUser(user: ManagedUser): void {
    this.deletingId.set(user._id);
    this.usersService.remove(user._id).subscribe({
      next: () => this.users.update((list) => list.filter((u) => u._id !== user._id)),
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to delete user.'),
      complete: () => this.deletingId.set(null),
    });
  }

  openCreatePanel(): void {
    this.createPanelOpen.set(true);
  }

  closeCreatePanel(): void {
    this.createPanelOpen.set(false);
  }

  createUser(): void {
    this.error.set(null);
    const fullName = this.draftFullName().trim();
    const email = this.draftEmail().trim();
    const password = this.draftPassword();
    if (!fullName || !email || !password) {
      this.error.set('Full name, email and password are required.');
      return;
    }

    this.creating.set(true);
    this.usersService
      .create({
        fullName,
        email,
        password,
        role: this.draftRole(),
        isEnabled: true,
      })
      .subscribe({
        next: (created) => {
          this.users.update((list) => [created, ...list]);
          this.draftFullName.set('');
          this.draftEmail.set('');
          this.draftPassword.set('');
          this.draftRole.set('viewer');
          this.createPanelOpen.set(false);
        },
        error: (err) => {
          const msg =
            err?.error?.message ??
            (typeof err?.error === 'string' ? err.error : null) ??
            err?.message ??
            'Unable to create user.';
          this.error.set(msg);
        },
        complete: () => this.creating.set(false),
      });
  }

  exportCsv(): void {
    this.exporting.set(true);
    this.usersService.exportCsv().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporting-users.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Unable to export users.'),
      complete: () => this.exporting.set(false),
    });
  }

  initials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }

  dateLabel(dateIso: string): string {
    const date = new Date(dateIso);
    return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
  }
}
