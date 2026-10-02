import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
readonly baseUrl = environment.apiUrl;
  private api = `${this.baseUrl}/equipment/`;
  constructor(private http: HttpClient) { }

  getAllEquipments(): Observable<any> {
    return this.http.get(this.api).pipe(
      catchError(throwError)
    );
  }
  getEquipmentById(id:string): Observable<any> {
    return this.http.get(this.api+id).pipe(
      catchError(throwError)
    );
  }
  getEquipmentByUser(userId:string): Observable<any> {
    return this.http.get(this.api+'getUserEquipments/'+userId).pipe(
      catchError(throwError)
    );
  }
  createEquipment(equipment:any): Observable<any> {
    return this.http.post(this.api , equipment).pipe(
      catchError(throwError)
    );
  }
  forwardEquipment(id:string,equipment:any): Observable<any> {
    return this.http.patch(this.api + id, equipment).pipe(
      catchError(throwError)
    );
  } 
  editEquipment(id:string,equipment:any): Observable<any> {
    return this.http.put(this.api + id, equipment).pipe(
      catchError(throwError)
    );
  } 
  deleteEquipment(id:string): Observable<any> {
    return this.http.delete(this.api + id).pipe(
      catchError(throwError)
    );
  }
  downloadUserItems(id: string): Observable<Blob> {
    return this.http.get(`${this.api}downloadUserItems/${id}`, { responseType: 'blob' }).pipe(
        catchError((error) => {
            console.error('Download failed:', error);
            return throwError(() => new Error('Failed to download PDF'));
        })
    );
}
//   downloadUserItems2(): Observable<Blob> {
//     return this.http.post(`${this.api}downloadUserItems2`,{}, { responseType: 'blob' }).pipe(
//         catchError((error) => {
//             console.error('Download failed:', error);
//             return throwError(() => new Error('Failed to download PDF'));
//         })
//     );
// }
  downloadAllItems(): Observable<Blob> {
    return this.http.post(`${this.api}downloadAllItems`,{}, { responseType: 'blob' }).pipe(
        catchError((error) => {
            console.error('Download failed:', error);
            return throwError(() => new Error('Failed to download PDF'));
        })
    );
}

}
