import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NetworkRequestService {
  readonly baseUrl = environment.INTERN_URL;
  private api_network= `${this.baseUrl}/network`;
 
  constructor(private http: HttpClient) { }

  addRequest(network : any):Observable<any> {
    return this.http.post(`${this.api_network}/addNetworkRequest`, network).pipe(
          catchError(throwError)
    );
  }
  getUserNetworkRequests():Observable<any> {
    return this.http.get(`${this.api_network}/getUserNetworkRequests`).pipe(
      catchError(throwError)
    );
  }
  getUserNetworkRequest(userId:string):Observable<any> {
    return this.http.get(`${this.api_network}/getUserNetworkRequest/`+ userId).pipe(
      catchError(throwError)
    );
  }
  approveNetworkRequest(reqId:string,data:any):Observable<any> {
    return this.http.put(`${this.api_network}/approveNetworkRequest/`+ reqId,data).pipe(
      catchError(throwError)
    );
  }
}
