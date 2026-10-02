import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdDocsService {

  readonly baseUrl = environment.INTERN_URL;
  private api = `${this.baseUrl}/docs/`;
  
  constructor(private http: HttpClient) { }

  getUserDocs(userId:any): Observable<any> {
    return this.http.get(this.api+'getUserDocs/'+userId).pipe(
      catchError(throwError)
    );
  }
  addCertif(data:any): Observable<any> {
    return this.http.patch(this.api+'add_attestation' ,data).pipe(
      catchError(throwError)
    );
  }
  deleteCertif(data:any): Observable<any> {
    return this.http.patch(this.api+'delete_attestation/'+data,{}).pipe(
      catchError(throwError)
    );
  }
}
