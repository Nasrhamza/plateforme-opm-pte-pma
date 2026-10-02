import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { Leave } from '../models/leave';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaveServiceService {
  readonly baseUrl = environment.apiUrl;
  private api = `${this.baseUrl}/leave/`;
  
  constructor(private http: HttpClient, private router: Router) { }

  getAllLeaves(): Observable<any> {
    return this.http.get(this.api + "getAllLeave").pipe(
      catchError(throwError)
    );
  }
  addLeave(leave:any): Observable<any> {
    return this.http.post(this.api + "createLeaveRequest",leave).pipe(
      catchError(throwError)
    );
  }
  getLeaveById(leaveID:string): Observable<any> {
    return this.http.get(this.api + "getLeaveById/"+leaveID).pipe(
      catchError(throwError)
    );
  }
  declineLeave(leaveID:string): Observable<any> {
    return this.http.delete(this.api + "declineLeave/"+leaveID).pipe(
      catchError(throwError)
    );
  }
  managerAccept(leaveID:string): Observable<any> {
    return this.http.put(this.api + "managerAccept/"+leaveID,{}).pipe(
      catchError(throwError)
    );
  }
  workerAccept(leaveID:string): Observable<any> {
    return this.http.put(this.api + "workerAccept/"+leaveID,{}).pipe(
      catchError(throwError)
    );
  }
  managerDecline(leaveID:string): Observable<any> {
    return this.http.put(this.api + "managerDecline/"+leaveID,{}).pipe(
      catchError(throwError)
    );
  }
  workerDecline(leaveID:string): Observable<any> {
    return this.http.put(this.api + "workerDecline/"+leaveID,{}).pipe(
      catchError(throwError)
    );
  }
  getUserLeave(userID:string): Observable<any> {
    return this.http.get(this.api + "getUserLeave/"+userID).pipe(
      catchError(throwError)
    );
  }
  getWorkerRequests(workerID:string): Observable<any> {
    return this.http.get(this.api + "getWorkerRequests/"+workerID).pipe(
      catchError(throwError)
    );
  }
}
