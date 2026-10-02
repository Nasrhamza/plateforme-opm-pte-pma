import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { EventModel } from "../models/event.model";

@Injectable({
    providedIn : 'root'
})
export class EventService {

    constructor(private _http: HttpClient) { }

    private readonly baseUrl = `${environment.apiUrl}/api/v1/events`;

    findAll(filter? : {user? : string}){
        let url = `${this.baseUrl}?`;
        if(filter){
            if (filter.user) url += `user=${filter.user}&`;
        }
        return this._http.get<ApiResponse<{events : EventModel[], total : number}>>(`${url}`)
    }
    findById(id : string){
        return this._http.get<ApiResponse<EventModel>>(`${this.baseUrl}/${id}`)
    }
    update(id : any, data : any){
        return this._http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, data)
    }
    add(data : any){
        return this._http.post<ApiResponse<any>>(`${this.baseUrl}`, data)
    }
    delete(id : string){
        return this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${id}`)
    }
}