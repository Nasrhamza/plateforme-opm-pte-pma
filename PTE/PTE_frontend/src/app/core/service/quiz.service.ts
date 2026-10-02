import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  readonly baseUrl = environment.INTERN_URL;
  private api_quiz = `${this.baseUrl}/quizzes`;
  private api_question = `${this.baseUrl}/questions`;

  constructor(private http: HttpClient) { }


  createQuestion(question:any){
    return this.http.post(this.api_question + "/",question).pipe(
      catchError(throwError)
    );
  }
  getQuestionsByQuiz(quizId:string): Observable<any> {
    return this.http.get(this.api_question + "/" + quizId).pipe(
      catchError(throwError)
    );
  }








  getOffers(): Observable<any> {
    return this.http.get(this.api_quiz + "/").pipe(
      catchError(throwError)
    );
  }
  getOfferQuiz(offerId:string): Observable<any> {
    return this.http.get(this.api_quiz + "/offer/" + offerId).pipe(
      catchError(throwError)
    );
  }
  getQuizById(id:string): Observable<any> {
    return this.http.get(this.api_quiz + "/" + id).pipe(
      catchError(throwError)
    );
  }
  createQuiz(quiz:any): Observable<any> {
    return this.http.post(this.api_quiz + "/" ,quiz).pipe(
      catchError(throwError)
    );
  }
  updateQuiz(id:any,quiz:any): Observable<any> {
    return this.http.put(this.api_quiz + "/"+id,quiz).pipe(
      catchError(throwError)
    );
  }
  deleteQuiz(id:any): Observable<any> {
    return this.http.delete(this.api_quiz + "/"+id).pipe(
      catchError(throwError)
    );
  }
}
