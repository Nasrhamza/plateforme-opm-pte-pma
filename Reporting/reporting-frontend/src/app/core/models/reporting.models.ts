export interface KpiDatum {
  value: number;
  [key: string]: string | number | null | undefined;
}

export interface KpiResponse {
  metric: string;
  dimensions: string[];
  filters: Record<string, string | number | null | undefined>;
  period: string;
  data: KpiDatum[];
  generatedAt: string;
  freshness: {
    source: string;
    strategy: string;
  };
  comparison?: {
    current_total: number;
    previous_total: number;
    delta: number;
    delta_rate: number | null;
    previous_filters: Record<string, string | number | null | undefined>;
  };
}

export interface OpmFilters {
  dateFrom?: string;
  dateTo?: string;
  contract?: string;
  department?: string;
  leaveType?: string;
  vehicle?: string;
  room?: string;
  technician?: string;
  teamLeader?: string;
  engineer?: string;
  project?: string;
  status?: string;
}

export type ReportPeriod = 'all' | 'range';
export type ReportSource = 'OPM' | 'PTE' | 'PMA';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

export interface ReportKpi {
  source: ReportSource;
  metric: string;
  label?: string;
}

export interface ReportFilters {
  status?: string[];
  period?: ReportPeriod;
  dateFrom?: string;
  dateTo?: string;
  teams?: string[];
  clients?: string[];
  departments?: string[];
}

export interface ReportSchedule {
  enabled: boolean;
  frequency?: ReportFrequency;
  format?: 'pdf' | 'xlsx' | 'json';
  recipients: string[];
  lastSentAt?: string;
}

export interface ReportConfigPayload {
  name: string;
  description?: string;
  kpis: ReportKpi[];
  filters: ReportFilters;
  schedule: ReportSchedule;
  isActive: boolean;
}

export interface ReportConfig extends ReportConfigPayload {
  _id: string;
  owner: string | { _id: string; fullName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'viewer';

export interface ManagedUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateManagedUserPayload {
  fullName?: string;
  role?: UserRole;
  isEnabled?: boolean;
  password?: string;
}

export interface CreateManagedUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isEnabled?: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MetadataOptions {
  departments: string[];
  clients: string[];
  contracts: string[];
  periods: ReportPeriod[];
}

