import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': "application/json ; multipart/form-data"
  }),
  withCredentials: true,
};
@Injectable({
  providedIn: 'root'
})
export class QuotesServiceService {

  quoatesApi: string = "https://api.quotable.io"
  newsApi:string = "https://newsapi.org/v2/top-headlines?category=technology&country=us&apiKey=0aeba459f4b943038128d0bedd4a387e"
  ItApi:string= "https://newsdata.io/api/1/news?apikey=pub_3742482f1925a45bfc298c76ddb954e8c0982&country=us,tn,fr,za&category=technology&language=fr,en"
  //newsKey = "0aeba459f4b943038128d0bedd4a387e"
  constructor(private http: HttpClient) { }

  getQuotes() : Observable<any>{
    return this.http.get(this.quoatesApi +"/quotes/random").pipe(
      catchError(throwError)
    )
  }
  getTopNews() : Observable<any>{
    return this.http.get(this.newsApi).pipe(
      catchError(throwError)
    )
  }
  getItNews() : Observable<any>{
    return this.http.get(this.ItApi,httpOptions).pipe(
      catchError(throwError)
    )
  }
}

