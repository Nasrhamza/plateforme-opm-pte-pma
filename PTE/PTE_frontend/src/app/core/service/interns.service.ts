import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { InternshipOffer } from '../models/InternshipOffer';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InternsService {

  readonly baseUrl = environment.INTERN_URL;
  private api_offer = `${this.baseUrl}/offers`;
  readonly baseUrl_intern = environment.INTERN_URL;
  private api_intern = `${this.baseUrl}/users/`;
  constructor(private http: HttpClient) { }

  addOffer(offer : InternshipOffer):Observable<any> {
    return this.http.post<InternshipOffer>(`${this.api_offer}/create`, offer);
  }
  getOffers(): Observable<any> {
    return this.http.get(this.api_offer + "/all").pipe(
      catchError(throwError)
    );
  }
  deleteOffer(id:string):Observable<any>{
    return this.http.delete(this.api_offer + "/" + id).pipe(
      catchError(throwError)
    );
  }
  editOffer(id:string, offer : InternshipOffer): Observable<any> {
    return this.http.put(this.api_offer + "/" + id, offer).pipe(
      catchError(throwError)
    );
  }
  getOfferById(id:string): Observable<any> {
    return this.http.get(this.api_offer + "/" + id).pipe(
      catchError(throwError)
    );
  }
  getInterns():Observable<any>{
    return this.http.get(this.api_intern + "getall").pipe(
      catchError(throwError)
    );
  }
  getInternRequest():Observable<any> {
    return this.http.get(this.api_intern + "signup/requests").pipe(
      catchError(throwError)
    );
  }
  confirmInternRequest(userID: string):Observable<any> {
    return this.http.post(this.api_intern + "confirm-signup/"+userID,{}).pipe(
      catchError(throwError)
    );
  }
  declineInternRequest(userID: string):Observable<any>{
    return this.http.post(this.api_intern + "delete/"+userID,{}).pipe(
      catchError(throwError)
    );
  }

}
