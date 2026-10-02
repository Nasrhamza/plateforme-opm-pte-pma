import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { LabEnv } from '../models/labEnv';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LabServiceService {
  readonly InternsBaseUrl = environment.INTERN_URL;
    private api_labs = `${this.InternsBaseUrl}/labs/`;
    private api_offers = `${this.InternsBaseUrl}/offers/`;

  readonly baseUrl = environment.apiUrl;
  private api = `${this.baseUrl}/material/virtualization/`;
  
  constructor(private http: HttpClient, private router: Router) { }

  getInternsLabsRequests(mentorid :string): Observable<any> {
    return this.http.get(this.api_labs + "getMentorLabs/" +mentorid).pipe(
      catchError(throwError)
    );
  }
  getAllInternLabs(): Observable<any> {
    return this.http.get(this.api_labs + "getAllInternLabs/").pipe(
      catchError(throwError)
    );
  }
  getMentorOffers(mentorid :string): Observable<any> {
    return this.http.get(this.api_offers + "getMentorOffers/" +mentorid).pipe(
      catchError(throwError)
    );
  }
  getAllMentorOffers(): Observable<any> {
    return this.http.get(this.api_offers + "all").pipe(
      catchError(throwError)
    );
  }
  getLabsByOffer(offerId :string): Observable<any> {
    return this.http.get(this.api_labs + "getLabsByOffer/" +offerId).pipe(
      catchError(throwError)
    );
  }
  approveLab(labId :string): Observable<any> {
    return this.http.put(this.api_labs + "approve/" +labId,{}).pipe(
      catchError(throwError)
    );
  }
  declineLab(labId :string): Observable<any> {
    return this.http.put(this.api_labs + "decline/" +labId,{}).pipe(
      catchError(throwError)
    );
  }



  getAllLabsRequests(): Observable<any> {
    return this.http.get(this.api + "getVirtsEnv").pipe(
      catchError(throwError)
    );
  }
  addLabRequest(labReq:LabEnv): Observable<any> {
    return this.http.post(this.api + "addaddVirtEnv",labReq).pipe(
      catchError(throwError)
    );
  }
  getLabRequest(labID:string): Observable<any> {
    return this.http.get(this.api + "getVirtEnv/"+labID).pipe(
      catchError(throwError)
    );
  }
  getLabRequestintern(labID:string): Observable<any> {
    return this.http.get(this.api_labs + "getVirtEnv/"+labID).pipe(
      catchError(throwError)
    );
  }
  deleteLabRequest(labID:string): Observable<any> {
    return this.http.delete(this.api + "deleteVirtEnv/"+labID).pipe(
      catchError(throwError)
    );
  }
  acceptLabRequest(labID:string,ressources:any): Observable<any> {
    return this.http.put(this.api + "accpectReq/"+labID,ressources).pipe(
      catchError(throwError)
    );
  }
  acceptLabRequestIntern(labID:string,ressources:any): Observable<any> {
    return this.http.put(this.api_labs + "managerApprove/"+labID,ressources).pipe(
      catchError(throwError)
    );
  }
  declineLabRequest(labID:string): Observable<any> {
    return this.http.put(this.api + "declineReq/"+labID,{status:"Declined"}).pipe(
      catchError(throwError)
    );
  }
  userLabRequests(userID:string): Observable<any> {
    return this.http.get(this.api + "getUserLabEnv/"+userID).pipe(
      catchError(throwError)
    );
  }
  getActiveLabs(): Observable<any> {
    return this.http.get(this.api + "allActiveLabs/").pipe(
      catchError(throwError)
    );
  }
}
