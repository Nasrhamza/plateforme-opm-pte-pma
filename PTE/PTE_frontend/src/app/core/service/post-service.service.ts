import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Like } from '../models/like';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostServiceService {
  readonly baseUrl = environment.apiUrl;
  private api = `${this.baseUrl}/post/`;
  private apiComment = `${this.baseUrl}/comment/`;
  private apiLike = `${this.baseUrl}/like/`;

  constructor(private http: HttpClient) { }

  getAllPosts(): Observable<any> {
    return this.http.get(this.api + "getAllApprovedPosts").pipe(
      catchError(throwError)
    );
  }
  getMyApprovedPosts(id:string): Observable<any> {
    return this.http.get(this.api + "getMyApprovedPosts/"+id).pipe(
      catchError(throwError)
    );
  }
  getMyDeclinededPosts(id:string): Observable<any> {
    return this.http.get(this.api + "getMyDeclinedPosts/"+id).pipe(
      catchError(throwError)
    );
  }
  getMyPendingPosts(id:string): Observable<any> {
    return this.http.get(this.api + "getMyPendingPosts/"+id).pipe(
      catchError(throwError)
    );
  }
  getPostById(id:String): Observable<any> {
    return this.http.get(this.api + "getPostById/"+id).pipe(
      catchError(throwError)
    );
  }
  addPost(post:any): Observable<any> {
    return this.http.post(this.api + "createPost",post).pipe(
      catchError(throwError)
    );
  }
  deletePost(id:string){
    return this.http.delete(this.api + "deletPost/"+id).pipe(
      catchError(throwError)
    );
  }
  savePost(Post_id: string,user_id:any){
    return this.http.patch(this.api + "savePost/"+Post_id,{user:user_id}).pipe(
      catchError(throwError)
    );
  }
  userSavedPosts(id:any){
    return this.http.get(this.api + "getUserSaved/"+id).pipe(
      catchError(throwError)
    );
  }
  updatePost(Post_id: string,data:any){
    return this.http.put(this.api + "updatePost/"+Post_id,data).pipe(
      catchError(throwError)
    );
  }
  getAllComments(postid:string) : Observable<any>{
    return this.http.get(this.apiComment + postid + '/getPostComments/').pipe(
      catchError(throwError)
    )
  }
  addComment(Post_id: string,data:any): Observable<any>{
    return this.http.post(this.apiComment + Post_id + '/addComment',data).pipe(
      catchError(throwError)
    )
  }
  deleteComment(Post_id:string,Comment_id:string) : Observable<any>{
    return this.http.delete(this.apiComment + Post_id +'/'+ Comment_id).pipe(
      catchError(throwError)
    )
  }
  updateComment(Post_id :string,comment_id:string,text:any) : Observable<any>{
    return this.http.put(this.apiComment + comment_id,{text}).pipe(
      catchError(throwError)
    )
  }
  addLike(Post_id:string,user:string) : Observable<any>{
    return this.http.post(this.apiLike + Post_id ,{user:user}).pipe(
      catchError(throwError)
    )
  }
  getLike(like:string) : Observable<any>{
    return this.http.get(this.apiLike + like).pipe(
      catchError(throwError)
    )
  }
  getLikers(like:string) : Observable<any>{
    return this.http.get(this.apiLike+"/getLikers/" + like).pipe(
      catchError(throwError)
    )
  }
  getAll() : Observable<any>{
    return this.http.get(this.api +"/getAllPosts").pipe(
      catchError(throwError)
    )
  }
  getAllstat() : Observable<any>{
    return this.http.get(this.api +"/getAllStats").pipe(
      catchError(throwError)
    )
  }
  managerAccept(id:string) : Observable<any>{
    return this.http.put(this.api +"managerAccept/"+id,{}).pipe(
      catchError(throwError)
    )
  }
  managerDecline(id:string) : Observable<any>{
    return this.http.put(this.api +"managerDecline/"+id,{}).pipe(
      catchError(throwError)
    )
  }
  postInteraction(id:string) : Observable<any>{
    return this.http.get(this.api +"postInteractionCount/"+id).pipe(
      catchError(throwError)
    )
  }

 
}
