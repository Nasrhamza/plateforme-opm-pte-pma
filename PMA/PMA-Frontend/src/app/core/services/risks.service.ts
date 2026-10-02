import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { Risk } from "../models/risk.model";

@Injectable({
    providedIn : 'root'
})
export class RisksService {

    constructor(private _http: HttpClient) { }

    private readonly baseUrl = `${environment.apiUrl}/api/v1/problems`;

    findAll(filter? : { user? : string, project? : string }){
        let url = `${this.baseUrl}?`;
        if(filter){
        if (filter.project) url += `project=${filter.project}&`;
        if (filter.user) url += `user=${filter.user}&`;
        }
        return this._http.get<ApiResponse<{risks : Risk[], total : number}>>(`${url}`)
    }
    findById(id : string){
        return this._http.get<ApiResponse<Risk>>(`${this.baseUrl}/${id}`)
    }
    update(id : any, data : any){
        return this._http.put<ApiResponse<Risk>>(`${this.baseUrl}/${id}`, data)
    }
    add(data : any){
        return this._http.post<ApiResponse<Risk>>(`${this.baseUrl}`, data)
    }
    delete(id : string){
        return this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${id}`)
    }
}