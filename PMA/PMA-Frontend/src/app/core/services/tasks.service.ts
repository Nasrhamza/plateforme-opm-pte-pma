import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { Task } from "../models/task.model";

@Injectable({
    providedIn : 'root'
})
export class TasksService {

    constructor(private _http: HttpClient) { }

    private readonly baseUrl = `${environment.apiUrl}/api/v1/tasks`;

    findAll(filter? : { Executor? : string, Project? : string, Title? : string, TeamLeader? : string, start? : string, end? : string, email? : string },page? :number, size? : number){
        let url = `${this.baseUrl}?`;
        if (page) url += `page=${page}&`;
        if (size) url += `size=${size}&`;
        
        if(filter){
            if (filter.Executor) url += `Executor=${filter.Executor}&`;
            if (filter.Title) url += `Title=${filter.Title}&`;
            if (filter.Project) url += `Project=${filter.Project}&`;
            if (filter.TeamLeader) url += `TeamLeader=${filter.TeamLeader}&`;
            if (filter.start) url += `start=${filter.start}&`;
            if (filter.end) url += `end=${filter.end}&`;
            if (filter.email) url += `email=${filter.email}&`;
        }
        return this._http.get<ApiResponse<{tasks : Task[], total : number}>>(`${url}`)
    }
    findById(id : string){
        return this._http.get<ApiResponse<Task>>(`${this.baseUrl}/${id}`)
    }
    update(id : any, data : any){
        return this._http.put<ApiResponse<Task>>(`${this.baseUrl}/${id}`, data)
    }
    add(data : any){
        return this._http.post<ApiResponse<Task>>(`${this.baseUrl}`, data)
    }
    delete(id : string){
        return this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${id}`)
    }
    findTasksByEngineer(userId : string, page? : number, size? : number){
        let url = `${this.baseUrl}/engineer/${userId}?`;
        if (page) url += `page=${page}&`;
        if (size) url += `size=${size}&`;
        return this._http.get<ApiResponse<{ pending : any, closed : any, all : any }>>(`${url}`)
    }
  
    findTasksByTeamLeader(id : string, page? : number, size? : number){
        let url = `${this.baseUrl}/leader/${id}?`;
        if (page) url += `page=${page}&`;
        if (size) url += `size=${size}&`;
        return this._http.get<ApiResponse<{tasks : Task[], total : number}>>(`${url}`)
    }

    changeTaskProgress(id : any, progress : number){
        return this._http.patch<ApiResponse<Task>>(`${this.baseUrl}/${id}/progress`, { progress })
    }
   
    defineTaskRatingWeight(id : any, ratingWeight : number){
        return this._http.patch<ApiResponse<{ rating : number }>>(`${this.baseUrl}/${id}/rating/weight`, { ratingWeight })
    }
    evaluateTaskCompletion(id : any, note : number){
        return this._http.patch<ApiResponse<{ rating : number }>>(`${this.baseUrl}/${id}/rating/note`, { note })
    }
}