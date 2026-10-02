import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CvServiceService {
  
  readonly baseUrl = environment.apiUrl;
  private api = `${this.baseUrl}/cv/`;

  constructor(private http: HttpClient) { }


  updateEducation(data:any,id:any){
    return this.http.patch(this.api+'updateEdu/'+id,data).pipe(
      catchError(throwError)
    );
  }
  updateExperience(data:any,id:any){
    return this.http.patch(this.api+'updateExp/'+id,data).pipe(
      catchError(throwError)
    );
  }
  updateCertification(data:any,id:any){
    return this.http.patch(this.api+'updateCert/'+id,data).pipe(
      catchError(throwError)
    );
  }
  updateProject(data:any,id:any){
    return this.http.patch(this.api+'updateProject/'+id,data).pipe(
      catchError(throwError)
    );
  }
  updateLanguage(data:any,id:any){
    return this.http.patch(this.api+'updateLanguage/'+id,data).pipe(
      catchError(throwError)
    );
  }
  updateSkill(data:any,id:any){
    return this.http.patch(this.api+'updateSkill/'+id,data).pipe(
      catchError(throwError)
    );
  }
  updateSummary(data:any,id:any){
    return this.http.patch(this.api+'updateSummary/'+id,data).pipe(
      catchError(throwError)
    );
  }


  getEducation(id:String){
    return this.http.get(this.api+'getEdu/'+id).pipe(
      catchError(throwError)
    );
  }
  getExperience(id:String){
    return this.http.get(this.api+'getExp/'+id).pipe(
      catchError(throwError)
    );
  }
  getCertification(id:String){
    return this.http.get(this.api+'getCertif/'+id).pipe(
      catchError(throwError)
    );
  }
  getProject(id:String){
    return this.http.get(this.api+'getProject/'+id).pipe(
      catchError(throwError)
    );
  }
  getLanguage(id:String){
    return this.http.get(this.api+'getLanguage/'+id).pipe(
      catchError(throwError)
    );
  }
  getSkill(id:String){
    return this.http.get(this.api+'getSkill/'+id).pipe(
      catchError(throwError)
    );
  }
  getUserCV(id:String){
    return this.http.get(this.api+'getUserCV/'+id).pipe(
      catchError(throwError)
    );
  }
  getSummary(id:String){
    return this.http.get(this.api+'getSummary/'+id).pipe(
      catchError(throwError)
    );
  }

  DeleteEducation(id:String){
    return this.http.delete(this.api+'deleteEdu/'+id).pipe(
      catchError(throwError)
    );
  }
  DeleteExperience(id:String){
    return this.http.delete(this.api+'deleteExp/'+id).pipe(
      catchError(throwError)
    );
  }
  DeleteCertification(id:String){
    return this.http.delete(this.api+'deleteCert/'+id).pipe(
      catchError(throwError)
    );
  }
  DeleteProject(id:String){
    return this.http.delete(this.api+'deleteProject/'+id).pipe(
      catchError(throwError)
    );
  }
  DeleteLanguage(id:String){
    return this.http.delete(this.api+'deleteLanguage/'+id).pipe(
      catchError(throwError)
    );
  }
  DeleteSkill(id:String){
    return this.http.delete(this.api+'deleteSkill/'+id).pipe(
      catchError(throwError)
    );
  }
 
  addEducation(data:any){
    return this.http.post(this.api+'addEdu/',data).pipe(
      catchError(throwError)
    );
  }
  addExperience(data:any){
    return this.http.post(this.api+'addExp/',data).pipe(
      catchError(throwError)
    );
  }
  addCertification(data:any){

    return this.http.post(this.api+'addCert/',data).pipe(
      catchError(throwError)
    );
  }
  addProject(data:any){
    return this.http.post(this.api+'addProj/',data).pipe(
      catchError(throwError)
    );
  }
  addLanguage(data:any){
    return this.http.post(this.api+'addLanguage/',data).pipe(
      catchError(throwError)
    );
  }
  addSkill(data:any){
    return this.http.post(this.api+'addSkill/',data).pipe(
      catchError(throwError)
    );
  }
  
  
}
