import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { ProjectsOverview, TasksOverview } from "../models/kpis.model";

@Injectable({
    providedIn : 'root'
})
export class KpiService {


    constructor(private _http: HttpClient) { }
    
    private readonly baseUrl = `${environment.apiUrl}/api/v1/kpis2`;

    getKpis(){
        return this._http.get<ApiResponse<{ projectsOverview: ProjectsOverview, tasksOverview : TasksOverview }>>(`${this.baseUrl}`)
    }
}