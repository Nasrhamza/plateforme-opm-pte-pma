import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KpiResponse, MetadataOptions, OpmFilters } from '../models/reporting.models';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  private buildParams(filters?: OpmFilters): HttpParams {
    let params = new HttpParams();
    if (!filters) return params;
    if (filters.dateFrom)    params = params.set('date_from', filters.dateFrom);
    if (filters.dateTo)      params = params.set('date_to', filters.dateTo);
    if (filters.contract)    params = params.set('contract', filters.contract);
    if (filters.department)  params = params.set('department', filters.department);
    if (filters.leaveType)   params = params.set('leave_type', filters.leaveType);
    if (filters.vehicle)     params = params.set('vehicle', filters.vehicle);
    if (filters.room)        params = params.set('room', filters.room);
    if (filters.technician)  params = params.set('technician', filters.technician);
    if (filters.teamLeader)  params = params.set('team_leader', filters.teamLeader);
    if (filters.engineer)    params = params.set('engineer', filters.engineer);
    if (filters.project)     params = params.set('project', filters.project);
    if (filters.status)      params = params.set('status', filters.status);
    return params;
  }

  private get<T>(path: string, filters?: OpmFilters): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${path}`, { params: this.buildParams(filters) });
  }

  // ── OPM ──────────────────────────────────────────────────────────────────────
  getOpmTicketsByStatus(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/opm/tickets-by-status', filters);
  }

  getOpmSlaCompliance(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/opm/sla-compliance', filters);
  }

  getOpmMttr(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/opm/mttr', filters);
  }

  getOpmMtta(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/opm/mtta', filters);
  }

  getOpmFirstCallResolution(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/opm/first-call-resolution', filters);
  }

  getOpmTechnicianLoad(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/opm/technician-load', filters);
  }

  getOpmContractHealth(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/opm/contract-health', filters);
  }

  // ── PTE ──────────────────────────────────────────────────────────────────────
  getPteLeaveConsumption(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pte/leave-consumption', filters);
  }

  getPteHeadcount(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pte/headcount', filters);
  }

  getPteVehicleUtilization(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pte/vehicle-utilization', filters);
  }

  getPteRoomOccupancy(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pte/room-occupancy', filters);
  }

  getPteVmLeadTime(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pte/vm-lead-time', filters);
  }

  getPteInterventionThroughput(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pte/intervention-throughput', filters);
  }

  // ── PMA ──────────────────────────────────────────────────────────────────────
  getPmaPortfolioStatus(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pma/portfolio-status', filters);
  }

  getPmaOverdueIndex(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pma/overdue-index', filters);
  }

  getPmaTasksByStatus(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pma/tasks-by-status', filters);
  }

  getPmaTasksByPriority(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pma/tasks-by-priority', filters);
  }

  getPmaOnTimeDelivery(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pma/on-time-delivery', filters);
  }

  getPmaTeamLeaderScore(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pma/team-leader-score', filters);
  }

  getPmaEngineerProductivity(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/pma/engineer-productivity', filters);
  }

  // ── Exec ─────────────────────────────────────────────────────────────────────
  getExecCompanyThroughput(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/exec/company-throughput', filters);
  }

  getExecPmScorecard(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/exec/pm-scorecard', filters);
  }

  getExecRevenueAtRisk(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/exec/revenue-at-risk', filters);
  }

  getExecClientHealth(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/exec/client-health', filters);
  }

  getExecWorkforceAvailability(filters?: OpmFilters): Observable<KpiResponse> {
    return this.get<KpiResponse>('/exec/workforce-availability', filters);
  }

  // ── Meta ─────────────────────────────────────────────────────────────────────
  getMetadataOptions(): Observable<MetadataOptions> {
    return this.http.get<MetadataOptions>(`${environment.apiUrl}/meta/options`);
  }

  // ── ETL ──────────────────────────────────────────────────────────────────────
  triggerEtl(): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/etl/run`, {});
  }

  // ── Legacy aliases (kept for backward compat with existing components) ────────
  /** @deprecated use getOpmFirstCallResolution */
  getOpmTicketsByPeriod(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getOpmFirstCallResolution(filters);
  }

  /** @deprecated use getOpmFirstCallResolution */
  getOpmResolutionRate(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getOpmFirstCallResolution(filters);
  }

  /** @deprecated use getOpmContractHealth */
  getOpmExpiredTickets(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getOpmContractHealth(filters);
  }

  /** @deprecated use getPteLeaveConsumption */
  getPteLeavesByType(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPteLeaveConsumption(filters);
  }

  /** @deprecated use getPteLeaveConsumption */
  getPteLeavesByDepartment(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPteLeaveConsumption(filters);
  }

  /** @deprecated use getPteVehicleUtilization */
  getPteVehicleUsage(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPteVehicleUtilization(filters);
  }

  /** @deprecated use getPteVehicleUtilization */
  getPteGasConsumption(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPteVehicleUtilization(filters);
  }

  /** @deprecated use getPteInterventionThroughput */
  getPteMissions(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPteInterventionThroughput(filters);
  }

  /** @deprecated use getPteInterventionThroughput */
  getPteMissionsList(filters?: OpmFilters, _page = 1, _limit = 20): Observable<{ items: KpiResponse['data']; total: number; page: number; limit: number }> {
    return this.getPteInterventionThroughput(filters).pipe(
      map(r => ({ items: r.data.slice((_page - 1) * _limit, _page * _limit), total: r.data.length, page: _page, limit: _limit }))
    );
  }

  /** @deprecated use getPteRoomOccupancy */
  getPteRoomUtilization(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPteRoomOccupancy(filters);
  }

  /** @deprecated use getPteVmLeadTime */
  getPteVirtualizationRequests(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPteVmLeadTime(filters);
  }

  /** @deprecated use getPmaPortfolioStatus */
  getPmaProjectsByStatus(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPmaPortfolioStatus(filters);
  }

  /** @deprecated use getPmaOverdueIndex */
  getPmaProjectsOverdue(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPmaOverdueIndex(filters);
  }

  /** @deprecated use getPmaEngineerProductivity */
  getPmaWorkload(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPmaEngineerProductivity(filters);
  }

  /** @deprecated use getPmaTeamLeaderScore */
  getPmaReclamations(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPmaTeamLeaderScore(filters);
  }

  /** @deprecated use getPmaTeamLeaderScore */
  getPmaRatings(filters?: OpmFilters): Observable<KpiResponse> {
    return this.getPmaTeamLeaderScore(filters);
  }
}
