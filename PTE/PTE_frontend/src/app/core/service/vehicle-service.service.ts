import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, OperatorFunction, catchError, map, throwError } from 'rxjs';
import { Vehicle } from '../models/vehicle';
import { EventInput } from '@fullcalendar/core';
import { FormGroup } from '@angular/forms';
import { VehicleEvent } from '../models/vehicleEvent';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleServiceService {
  readonly baseUrl = environment.apiUrl;
  readonly opmUrl = environment.OPM_BACKEND;
  readonly pmaUrl = environment.PMA_BACKEND;
  private api = `${this.baseUrl}/material/vehicle/`;
  private opmApi = `${this.opmUrl}/ticket/ticketReservation`;
  // private pmaApi = `${this.pmaUrl}/ticket/ticketReservation`;

  constructor(private http: HttpClient, private router: Router) { }

  getVehicles(): Observable<any> {
    return this.http.get(this.api + "getVehicles").pipe(
      catchError(throwError)
    );
  }
  addVehicle(vehicle: Vehicle): Observable<any> {
    return this.http.post(this.api + "addVehicle", vehicle).pipe(
      catchError(throwError)
    );
  }
  deleteVehicle(id: string): Observable<any> {
    return this.http.delete(this.api + "deleteVehicle/" + id).pipe(
      catchError(throwError)
    );
  }
  getVehicleById(id: any): Observable<any> {
    return this.http.get(this.api + "getVehicleById/" + id).pipe(
      catchError(throwError)
    );
  }
  editVehicle(id: string,form: FormGroup): Observable<any> {
    return this.http.put(this.api + "editVehicle/" + id,form).pipe(
      catchError(throwError)
    );
  }
  addEvent(vehicleEvent: VehicleEvent): Observable<any> {
    return this.http.post(this.api + "setevent", vehicleEvent)
  }
  getVehicleEvents(vehicleID:string) {
    return this.http.get(this.api + "getVehicleEvents/"+vehicleID).pipe(
      catchError(throwError)
    );
  }
  getAllEvents() {
    return this.http.get(this.api + "getAllEvents/").pipe(
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
    return this.http.delete(this.api + "deleteEvent/"+eventID).pipe(
      catchError(throwError)
    );
  }
  checkVehicleAvailability(data:any) {
    return this.http.post(this.api + "checkVehicleAvailability/",data).pipe(
      catchError(throwError)
    );
  }
  toggleAvailability(id: string) {
    return this.http.patch<any>(this.api + "changeAvailability/"+id, {});
  }

  checkCaseNumberRelatedToCurrentUser(email:string,caseId:string){
    return this.http.post(this.opmApi,{email:email,caseId:caseId}).pipe(
      catchError(throwError)
    );
  }
  checkProjectsRelatedToCurrentUser(email:string,ref:string){
    return this.http.post(this.pmaUrl,{email:email,ref:ref}).pipe(
      catchError(throwError)
    );
  }






  addvehicleCard(card : any){
    return this.http.post(this.api + "addVehicleCard" ,card).pipe(
      catchError(throwError)
    );
  }

  addConsumption(data : any){
    return this.http.post(this.api + "addConsumption" ,data).pipe(
      catchError(throwError)
    );
  }
  updateVehicleCard(cardId : any ,card : any){
    return this.http.put(this.api + "updateVehicleCard/" +cardId , card).pipe(
      catchError(throwError)
    );
  }
  getVehicleCard(vehicleId : any){
    return this.http.get(this.api + "getVehicleCard/" +vehicleId).pipe(
      catchError(throwError)
    );
  }



}
