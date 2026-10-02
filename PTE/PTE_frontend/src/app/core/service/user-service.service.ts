import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { Observable, catchError, throwError } from 'rxjs';
import { TechEvent } from '../models/techEvent';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  readonly baseUrl = environment.apiUrl;
  private api = `${this.baseUrl}/users/`;

  imagesURL=environment.PICSURL
  external_Cv = environment.EXTERNAL_DOCS_URL;
  signature_url = environment.SIGNATURE_URL
  private userID! :string
  private user!: User;
  drivers!:User[]
  applicants!:User[]

  constructor(private http:HttpClient, private router:Router) { }

  getImage(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  getUserRequest():Observable<any> {
    return this.http.get(this.api + "signup/requests").pipe(
      catchError(throwError)
    );
  }
 
  confirmUserRequest(userID: string):Observable<any>{
    return this.http.post(this.api + "confirm-signup/"+userID,{}).pipe(
      catchError(throwError)
    );
  }
  declineUserRequest(userID: string):Observable<any>{
    return this.http.delete(this.api + "delete/"+userID).pipe(
      catchError(throwError)
    );
  }
  
  getExternalEmployees(): Observable<any>{
    return this.http.get(this.api + "sousTraitant").pipe(
      catchError(throwError)
    );
  }
  getEmployees(): Observable<any>{
    return this.http.get(this.api + "getall").pipe(
      catchError(throwError)
    );
  }
  getAllTeamLeaders(): Observable<any>{
    return this.http.get(this.api + "getAllTeamLeaders").pipe(
      catchError(throwError)
    );
  }
  getAllDrivers(){
    return this.http.get(this.api + "drivers").pipe(
      catchError(throwError)
    );
  }
  getAllApplicants(){
    return this.http.get(this.api + "getall").pipe(
      catchError(throwError)
    );
  }
  getTechEvents(techID:string) {
    return this.http.get(this.api + "getTechEvents/"+techID).pipe(
      catchError(throwError)
    );
  }
  getEventById(eventID:string) {
    return this.http.get(this.api + "getEventById/"+eventID).pipe(
      catchError(throwError)
    );
  }
  updateEvent(eventID:string,event:any) {
    return this.http.put(this.api + "updateEvent/"+eventID,event).pipe(
      catchError(throwError)
    );
  }
  deleteEvent(eventID:string) {
    console.log(eventID)
    return this.http.delete(this.api + "deleteEvent/"+eventID).pipe(
      catchError(throwError)
    );
  }
  addTechEvent(techEvent: TechEvent): Observable<any> {
    return this.http.post(this.api + "setevent", techEvent).pipe(
      catchError(throwError)
    );
  }
  getUserById(userID:string){
    return this.http.get(this.api + "getUserByID/" + userID).pipe(
      catchError(throwError)
    );
  }
  getUserByEmail(userEmail:string){
    return this.http.post(this.api + "getUserByEmail/" , {email:userEmail}).pipe(
      catchError(throwError)
    );
  }
  updateUser(userID:string,userForm: any){
    return this.http.put(this.api + "update/" + userID,userForm).pipe(
      catchError(throwError)
    );
  }
  updatePass(userID:string,userForm: any){
    return this.http.patch(this.api + "updatePass/" + userID,userForm).pipe(
      catchError(throwError)
    );
  }
  updateRoles(userID:string,newRoles:any){
    return this.http.patch(this.api + "update-roles/" + userID,newRoles).pipe(
      catchError(throwError)
    );
  }
  getAllEvents(){
    return this.http.get(this.api + "allUserEvents/").pipe(
      catchError(throwError)
    );
  }
  getEventsLog(data: any){
    return this.http.post(this.api + "getEventsByDate/",data).pipe(
      catchError(throwError)
    );
  }
  addExternal(data: any){
    return this.http.post(this.api + "addExternal",data).pipe(
      catchError(throwError)
    );
  }
  switchUser(userID:any){
    return this.http.patch(this.api + "switchToExternal/"+userID,{}).pipe(
      catchError(throwError)
    );
  }
  downloadfile(file:any){
    return this.http.get(`${this.external_Cv}${file}`, { responseType: 'blob' })
  }
  uploadSignature(id:any,file:any){
    return this.http.patch(this.api+"uploadSignature/"+id,file).pipe(
      catchError(throwError)
    );
  }
  getAdmin(){
    return this.http.get(this.api+"getAdmin/").pipe(
      catchError(throwError)
    );
  }
}
