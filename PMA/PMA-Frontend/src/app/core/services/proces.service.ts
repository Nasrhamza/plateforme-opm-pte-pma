import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { Task } from "../models/task.model";
import { ProcesV } from "../models/proces.model";

@Injectable({
    providedIn : 'root'
})
export class ProcesService {

    constructor(private _http: HttpClient) { }

    private readonly baseUrl = `${environment.apiUrl}/api/v1/procesV`;

    findAll(filter? : { equipe? : string, Project? : string, Titre? : string, Sender? : string }){
        let url = `${this.baseUrl}?`;
        if(filter){
        if (filter.equipe) url += `Executor=${filter.equipe}&`;
        if (filter.Titre) url += `Title=${filter.Titre}&`;
        if (filter.Project) url += `Project=${filter.Project}&`;
        if (filter.Sender) url += `Sender=${filter.Sender}&`;
        }
        return this._http.get<ApiResponse<{proces : ProcesV[], total : number}>>(`${url}`)
    }
    findById(id : string){
        return this._http.get<ApiResponse<ProcesV>>(`${this.baseUrl}/${id}`)
    }
    update(id : any, data : any){
        return this._http.put<ApiResponse<ProcesV>>(`${this.baseUrl}/${id}`, data)
    }
    add(data : any){
        return this._http.post<ApiResponse<ProcesV>>(`${this.baseUrl}`, data)
    }
    delete(id : string){
        return this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${id}`)
    }
}