import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccessoryService {
 readonly baseUrl = environment.apiUrl;
  private api = `${this.baseUrl}/accessory/`;
  constructor(private http: HttpClient) { }

  getAllAccessories(): Observable<any> {
    return this.http.get(this.api).pipe(
      catchError(throwError)
    );
  }
  getAccessoryById(id:string): Observable<any> {
    return this.http.get(this.api+id).pipe(
      catchError(throwError)
    );
  }
  getAccessoriesByUser(userId:string): Observable<any> {
    return this.http.get(this.api+'getUserAccessories/'+userId).pipe(
      catchError(throwError)
    );
  }
  createAccessory(accessory:any): Observable<any> {
    return this.http.post(this.api , accessory).pipe(
      catchError(throwError)
    );
  }
  forwardAccessory(id:string,accessory:any): Observable<any> {
    return this.http.patch(this.api + id, accessory).pipe(
      catchError(throwError)
    );
  } 
  editAccessory(id:string,accessory:any): Observable<any> {
    return this.http.put(this.api + id, accessory).pipe(
      catchError(throwError)
    );
  } 
  deleteAccessory(id:string): Observable<any> {
    return this.http.delete(this.api + id).pipe(
      catchError(throwError)
    );
  }

}
