import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse, ReportConfig, ReportConfigPayload } from '../models/reporting.models';

@Injectable({ providedIn: 'root' })
export class ReportConfigService {
  constructor(private http: HttpClient) {}

  list(page = 1, limit = 9, q = ''): Observable<PagedResponse<ReportConfig>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('q', q);
    return this.http.get<any>(`${environment.apiUrl}/reports`, { params }).pipe(
      map((res) => {
        // Backward compat: older backend returns array.
        if (Array.isArray(res)) {
          return { items: res, total: res.length, page: 1, limit: res.length };
        }
        return res as PagedResponse<ReportConfig>;
      })
    );
  }

  getOne(id: string): Observable<ReportConfig> {
    return this.http.get<ReportConfig>(`${environment.apiUrl}/reports/${id}`);
  }

  create(payload: ReportConfigPayload): Observable<ReportConfig> {
    return this.http.post<ReportConfig>(`${environment.apiUrl}/reports`, payload);
  }

  update(id: string, payload: Partial<ReportConfigPayload>): Observable<ReportConfig> {
    return this.http.put<ReportConfig>(`${environment.apiUrl}/reports/${id}`, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/reports/${id}`);
  }

  export(id: string, format: 'pdf' | 'xlsx' | 'json'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${environment.apiUrl}/reports/${id}/export`, { params, responseType: 'blob' });
  }

  run(id: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/reports/${id}/run`, {});
  }

  refreshScheduler(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${environment.apiUrl}/reports/_scheduler/refresh`, {});
  }
}
