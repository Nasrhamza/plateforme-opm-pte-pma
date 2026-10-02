import { Injectable } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { AuthResponse } from "../models/auth-response.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "src/environments/environment.development";
import { User } from "../models/user.model";

@Injectable({
    providedIn : 'root'
})
export class UserService {

    constructor(private _http: HttpClient,
        private _router: Router,
      ) { }

    private authenticatedUserSubject = new BehaviorSubject<AuthResponse | null>(null);
    authenticatedUser$ = this.authenticatedUserSubject.asObservable();

    readonly PMA_APP_KEY = "PMA_APP_KEY"
    private tokenExpirationTimer: any;

    private readonly baseUrl = `${environment.apiUrl}/api/v1/users`;


    getLoggedUser() {
      return this.authenticatedUserSubject.value;
    }


    //update password
  updatePassword(id : string, data : any) {
    return this._http.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/password`, data);
  }

  changeRole(id : string, role : String){
    return this._http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/role`, { role }).pipe(
      map(res=>({
        message : res.message,
        data : {
          ...res.data,
          image : `${environment.userImagesUrl}/${res.data!.image}`
        } as User
      }))
    )
  }

  addUser(data : any) {
    return this._http.post<ApiResponse<User>>(`${this.baseUrl}`, data).pipe(
      map(res=>({
        ...res,
        data : {
          ...res.data,
          image : `${environment.userImagesUrl}/${res.data!.image}`
        }
      }))
    );
  }

  fetchUsersOverview(){
    return this._http.get<ApiResponse<{ engineers : number, clients : number, leaders : number }>>(`${this.baseUrl}/roles/overview`);
  }
  
  updateUser(id : string, data : any) {
    return this._http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, data).pipe(
      map(res=>({
        ...res,
        data : {
          ...res.data!,
          image: `${environment.userImagesUrl}/${res.data!.image}`
        }
      }))
    );
  }

  updateImage(id : string, file : File){
    const formData = new FormData();
    formData.append('image', file)
    return this._http.patch<ApiResponse<string>>(`${this.baseUrl}/${id}/avatar`, formData)
  }

  //switchRoles
  switchRoles(){
    const currentUser =  localStorage.getItem("CurrentUser");
    if(currentUser == null || currentUser == undefined){
      return;
    }
    
    let new_role;
    const currentRole = JSON.parse(currentUser).roles[0];
    new_role = currentRole === 'ENGINEER' ? 'TEAM LEADER' : 'ENGINEER';
    
    return this._http.post(`${this.baseUrl}/roles/switch`,
      { 
        userId : this.getLoggedUser()?.id, 
        role : new_role 
      }
    );
  }

  updateProfile(id : string, data : any){
    return this._http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/profile`, data);
  }

  updateuserRole(id: any, data : any){
    return this._http.patch(`${this.baseUrl}/update-roles/${id}`, data);
  }
  forgotpasswd(email : string){
    return this._http.post<{ message : string }>(`${this.baseUrl}/forgotPassword`, email);
  }
  checkpass(data : any){
    return this._http.post(`${this.baseUrl}/checkpass`, data);
  }
  validateCode(data : any){
    return this._http.post<{ message : string }>(`${this.baseUrl}/validateCode`, data);
  }
  changePswdAutorisation(id: any){
    return this._http.get(`${this.baseUrl}/changePswdAutorisation/${id}`);
  }
  change_psw(data : any){
    return this._http.patch<{ message : string }>(`${this.baseUrl}/changePwd`, data);
  }
  enableUser(id : string){
    return this._http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/enable`, {}).pipe(
      map(res=>({
        message : res.message,
        data : {
          ...res.data,
          image : `${environment.userImagesUrl}/${res.data!.image}`
        } as User
      }))
    );
  }
  getallUsers(){
    return this._http.get<ApiResponse<User[]>>(`${this.baseUrl}/getall`).pipe(
      map(res => res.data!.map((user : any) => ({ ...user, image: `${environment.userImagesUrl}/${user.image}` })))
    );
  }
  findAll(filter? : { id? : string, roles? : string[], enabled? : boolean }){
    let url = `${this.baseUrl}?`;
    if(filter){
      if (filter.id) url += `id=${filter.id}&`;
      if (filter.roles) url += `roles=${filter.roles.join('-')}&`;
      if (filter.enabled) url += `enabled=${filter.enabled}&`;
    }

    return this._http.get<ApiResponse<{ users :  User[], total : number}>>(`${url}`).pipe(
      map(res => {
        return {
          data : {
            ...res.data,
            users : res.data?.users.map(user => ({ ...user, image: `${environment.userImagesUrl}/${user.image}` }))
          },
          message : res.message
        }
      })
    );
  }
  findMyClients(id : string){
    let url = `${this.baseUrl}/${id}/clients`;
    return this._http.get<ApiResponse<User[]>>(`${url}`).pipe(
      map(res => {
        return {
          data : res.data?.map(user => ({ ...user, image: `${environment.userImagesUrl}/${user.image}`})),
          message : res.message
        }
      })
    );
  }
  findTeamLeaderClients(id : string){
    let url = `${this.baseUrl}/leader/${id}/clients`;
    return this._http.get<ApiResponse<User[]>>(`${url}`).pipe(
      map(res => {
        return {
          data : res.data?.map(user => ({ ...user, image: `${environment.userImagesUrl}/${user.image}`})),
          message : res.message
        }
      })
    );
  }
  filter(data : any){
    return this._http.post(`${this.baseUrl}/filter`, data);
  }
  searchUsers(data : any){
    return this._http.post(`${this.baseUrl}/search`, data);

  }
  deleteUser(id: any){
    return this._http.delete<{ message : string, data : { _id : string } }>(`${this.baseUrl}/${id}`);
  }
  findById(id: any){
    let url = `${this.baseUrl}/${id}`;
    return this._http.get<ApiResponse<User>>(`${url}`).pipe(
      map(res => ({ 
        ...res, 
        data : {
          ...res.data!,
          image: `${environment.userImagesUrl}/${res.data!.image}` 
        }
      })
    )
  )
  }
  getallEngineer() {
    return this._http.get<User[]>(`${this.baseUrl}/getAllEng`).pipe(
      map((users: any) => users.map((user : any) => ({ ...user, image: `${environment.userImagesUrl}/${user.image}` })))
    );


  }
  getEngineer(){
    return this._http.get<User[]>(`${this.baseUrl}/getEngi`).pipe(
      map(users => users.map(user => ({ ...user, image: `${environment.userImagesUrl}/${user.image}` })))
    )
  }
  getAllEngineersAndTeamLeaders(){
    return this._http.get<User[]>(`${this.baseUrl}/getAllEngineersAndTeamLeaders`).pipe(
      map(users => users.map(user => ({ ...user, image: `${environment.userImagesUrl}/${user.image}` })))
    )
  }
  getallCient(){
    return this._http.get<[]>(`${this.baseUrl}/getAllClient`).pipe(
      map((users: any) => users.map((user : any) => ({ ...user, image: `${environment.userImagesUrl}/${user.image}` })))
    );

  }
  getallTeamLeader(){
    return this._http.get<[]>(`${this.baseUrl}/getAllTeamLeader`).pipe(
      map(users => users.map((user : any) => ({ ...user, image: `${environment.userImagesUrl}/${user.image}` })))
    );

  }
  sendMail(data : any){
    return this._http.post(`${this.baseUrl}/email`, data);
  }    
    }