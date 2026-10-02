import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Task } from '../models/Task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  readonly baseUrl = environment.INTERN_URL;
  private api_task = `${this.baseUrl}/tasks`;
  constructor(private http: HttpClient) { }

   getTasks(): Observable<any> {
      return this.http.get(this.api_task + "").pipe(
        catchError(throwError)
      );
    }
   getTaskById(taskId:string): Observable<any> {
      return this.http.get(this.api_task + "/"+taskId).pipe(
        catchError(throwError)
      );
    }
   createTask(task : any): Observable<any> {
      return this.http.post(this.api_task + "/",task).pipe(
        catchError(throwError)
      );
    }
    getOfferTasks(offerId: string): Observable<any> {
      return this.http.get(this.api_task +"/offer/"+offerId).pipe(
        catchError(throwError)
      );
    }
    deleteTask(taskId: string): Observable<any> {
      return this.http.delete(this.api_task +"/"+taskId).pipe(
        catchError(throwError)
      );
    }
    editTask(taskId: string,task:any): Observable<any> {
      return this.http.put(this.api_task +"/"+taskId,task).pipe(
        catchError(throwError)
      );
    }
}
