import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { map } from "rxjs";

@Injectable({
    providedIn : 'root'
})
export class ProjectService {

    constructor(private _http: HttpClient) { }

    private readonly baseUrl = `${environment.apiUrl}/api/v1/projects`;

    findAll(filter? : { equipe? : string, TeamLeader? : string, client? : string, Projectname? : string, year? : string, department? : string }){
        let url = `${this.baseUrl}?`;
        if(filter){
        if (filter.TeamLeader) url += `TeamLeader=${filter.TeamLeader}&`;
        if (filter.equipe) url += `equipe=${filter.equipe}&`;
        if (filter.client) url += `client=${filter.client}&`;
        if (filter.Projectname) url += `Projectname=${filter.Projectname}&`;
        if (filter.year) url += `year=${filter.year}&`;
        if (filter.department) url += `type=${filter.department}&`;
        }
        return this._http.get<ApiResponse<{projects : Project[], total : number}>>(`${url}`)
    }
    findById(id : string){
        return this._http.get<ApiResponse<Project>>(`${this.baseUrl}/${id}`).pipe(
            map(res=>{
                const project = res.data;
                // if(project?.hasFilesRatingConfig){
                //     if(!project.requiredRatingFiles.includes('Appreciation Letter')){
                //         project.requiredRatingFiles.push('Appreciation Letter');
                //     };
                // };
                return {
                    ...res,
                    data : project
                }
            })
        );
    }
    updateProject(id : any, data : any){
        return this._http.put<ApiResponse<Project>>(`${this.baseUrl}/${id}`, data);
    }
    generateProjectFromText(text : string){
        return this._http.post<ApiResponse<any>>(`${this.baseUrl}/generate`, { text });
    }
    getCurrentAndLastYearprojects(){
        return this._http.get<ApiResponse<{ last : number[], current : number[] }>>(`${this.baseUrl}/compare/current-last-year`);
    }
    addProject(data : any){
        return this._http.post<ApiResponse<Project>>(`${this.baseUrl}`, data)
    }
    delete(id : string){
        return this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${id}`)
    }
    getMyTeams(filter? : { equipe? : string }){
        let url = `${this.baseUrl}/myteam?`;
        if(filter){
            if (filter.equipe) url += `equipe=${filter.equipe}&`;
        }
        return this._http.get<ApiResponse<any>>(`${url}`)
    }
    getEquipeByProject(projectId : string){
        let url = `${this.baseUrl}/${projectId}/equipe?`;
        return this._http.get<ApiResponse<any>>(`${url}`)
    }

    sendfile(data:{ projectName : string, fileName : string, receiverEmail: string }){
        return this._http.post<{ message : string }>(`${this.baseUrl}/shareFile`,data)
    }

    downloadFile(filename: string){
        return this._http.get(`${environment.apiUrl}/download/${filename}`, { responseType : 'blob' }).subscribe(
            (response : any) => {
                const url = window.URL.createObjectURL(response);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        );
    }

    noteProject(projectId : string, clientId : string, note : number){
        return this._http.patch<ApiResponse<any>>(`${this.baseUrl}/${projectId}/note`, { clientId, note : note*100 })
    }

    getTotalFiles(){
        return this._http.get<any>(`${environment.apiUrl}/getProjectsFilesCount`);
    }

    deleteFile(id: string, type: string){
        return this._http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}/files?fileType=${type}`)
    }

    uploadFile(projectId : string, type : string, file : File){
        const formData = new FormData()
        formData.append('file', file);
        formData.append('fileType', type);
        return this._http.patch<ApiResponse<any>>(`${this.baseUrl}/${projectId}/files`, formData)
    }

    uploadMutipleFiles(projectId : string, files : { type : string, file : File }[]){
        const formData = new FormData()
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            formData.append(`file`, element.file);
            formData.append(`fileType`, element.type);   
        }
        return this._http.patch<ApiResponse<any>>(`${this.baseUrl}/${projectId}/files1`, formData)
    }

    findClientProjects(id : string){
        return this._http.get<ApiResponse<{ all : number, pending : number, inProgress : number, completed : number, projects : Project[] }>>(`${this.baseUrl}/client/${id}`)
    }
    
    findProjectsOverview(){
        return this._http.get<ApiResponse<ProjectsOverview>>(`${this.baseUrl}/status`)
    }
    
    findTeamLeadersParticipations(){
        return this._http.get<ApiResponse<{ leader : User, participations : number }[]>>(`${this.baseUrl}/leaders/participations`)
    }
    
    findEngineerParticipations(){
        return this._http.get<ApiResponse<{ engineer : User, participations : number }[]>>(`${this.baseUrl}/engineer/participations`)
    }
    
    configureFilesRatingConfig(projectId : string, requiredFiles : string[]){
        return this._http.patch<ApiResponse<any>>(`${this.baseUrl}/${projectId}/rating/files`, { requiredFiles })
    }
    getProjectRating(projectId : string){
        return this._http.get<ApiResponse<any>>(`${environment.apiUrl}/api/v1/ratings/project/${projectId}/overview`)
    }
    rateTeamLeader(projectId : string, note : number){
        return this._http.patch<ApiResponse<{ message : string, data : number }>>(`${environment.apiUrl}/api/v1/ratings/project/${projectId}/leader`, { note })
    }
    memberEvaluateTeamLeader(projectId : string, userId : string, note : number){
        return this._http.patch<ApiResponse<{ message : string, data : number }>>(`${environment.apiUrl}/api/v1/ratings/project/${projectId}/member-note`, { note, userId })
    }
}

export type ProjectsOverview = {
    all : { total : number, projects : Project[] },
    completed : { total : number, projects : Project[] },
    inProgress : { total : number, projects : Project[] },
    overdue : { total : number, projects : Project[] },
    pending : { total : number, projects : Project[] },
}