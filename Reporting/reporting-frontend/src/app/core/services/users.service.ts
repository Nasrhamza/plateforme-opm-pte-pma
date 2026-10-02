import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateManagedUserPayload, ManagedUser, PagedResponse, UpdateManagedUserPayload } from '../models/reporting.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  create(payload: CreateManagedUserPayload): Observable<ManagedUser> {
    return this.http.post<ManagedUser>(`${environment.apiUrl}/users`, payload);
  }

  list(page = 1, limit = 10, q = ''): Observable<PagedResponse<ManagedUser>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('q', q);
    return this.http.get<any>(`${environment.apiUrl}/users`, { params }).pipe(
      map((res) => {
        // Backward compat: older backend returns array.
        if (Array.isArray(res)) {
          return { items: res, total: res.length, page: 1, limit: res.length };
        }
        return res as PagedResponse<ManagedUser>;
      })
    );
  }

  update(id: string, payload: UpdateManagedUserPayload): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${environment.apiUrl}/users/${id}`, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/users/${id}`);
  }

  exportCsv(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/users/export`, { responseType: 'blob' });
  }
}
