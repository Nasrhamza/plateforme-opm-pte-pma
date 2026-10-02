import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { Reclamation } from "../models/reclamation.model";

@Injectable({
    providedIn : 'root'
})
export class ReclamationService {

    constructor(private _http: HttpClient) { }

    private readonly baseUrl = `${environment.apiUrl}/api/v1/reclamations`;

    findAll(filter? : { project? : string, client? : string }){
        let url = `${this.baseUrl}?`;
        if(filter){
        if (filter.client) url += `client=${filter.client}&`;
        if (filter.project) url += `project=${filter.project}&`;
        }
        return this._http.get<ApiResponse<{reclamations : Reclamation[], total : number}>>(`${url}`)
    }
    findById(id : string){
        return this._http.get<ApiResponse<Reclamation>>(`${this.baseUrl}/${id}`)
    }
    findByProject(projectId : string){
        return this._http.get<ApiResponse<{ reclamations : Reclamation[], total: number }>>(`${this.baseUrl}/project/${projectId}`)
    }
    findOverview(){
        return this._http.get<ApiResponse<{total : number, pending : number, treated : number, inTreatement : number}>>(`${this.baseUrl}/overview/get`)
    }
    update(id : any, data : any){
        return this._http.put<ApiResponse<Reclamation>>(`${this.baseUrl}/${id}`, data)
    }
    add(data : { name : string }){
        return this._http.post<ApiResponse<Reclamation>>(`${this.baseUrl}`, data)
    }
    delete(id : string){
        return this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${id}`)
    }
    
    findByTeamLeader(id : string){
        return this._http.get<ApiResponse<{reclamations : Reclamation[], total : number}>>(`${this.baseUrl}/leader/${id}`)
    }
    findClientReclamations(id : string){
        return this._http.get<ApiResponse<{reclamations : Reclamation[], total : number, pending : number, treated : number, inTreatement : number}>>(`${this.baseUrl}/client/${id}`)
    }
    
    respondToReclamation(id: string, message: string){
        return this._http.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/response`, { message })
    }
}