import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { ProjectFile } from "../models/project_file.model";
import { map } from "rxjs";

@Injectable({
    providedIn : 'root'
})
export class FilesService {

    constructor(private _http: HttpClient) { }

    private readonly baseUrl = `${environment.apiUrl}/api/v1/files`;

    findAll(filter? : { project? : string, id? : string, type? : string }){
        let url = `${this.baseUrl}?`;
        if(filter){
            if (filter.project) url += `project=${filter.project}&`;
            if (filter.id) url += `id=${filter.id}&`;
            if (filter.type) url += `type=${filter.type}&`;
        }
        return this._http.get<ApiResponse<{files : ProjectFile[], total : number}>>(`${url}`).pipe(
            map(res=>{
                const groupedFiles = res.data?.files.reduce((acc : any, file : any)=>{
                    let typeGroup = acc.find((group:any) => group.type.toLowerCase() === file.type.toLowerCase());
                    
                    if (!typeGroup) {
                        typeGroup = { type: file.type, files: [] };
                        acc.push(typeGroup);
                    }
                    typeGroup.files.push(file);
                    return acc;
                }, [])
                return groupedFiles;
            })
        )
    }
    findById(id : string){
        return this._http.get<ApiResponse<ProjectFile>>(`${this.baseUrl}/${id}`)
    }
    // update(id : any, data : any){
    //     return this._http.put<ApiResponse<Task>>(`${this.baseUrl}/${id}`, data)
    // }
    // add(data : any){
    //     return this._http.post<ApiResponse<Task>>(`${this.baseUrl}`, data)
    // }
    delete(id : string){
        return this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${id}`)
    }
}