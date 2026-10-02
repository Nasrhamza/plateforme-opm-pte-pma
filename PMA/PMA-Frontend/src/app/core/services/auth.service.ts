import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AuthResponse } from "../models/auth-response.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "src/environments/environment.development";

@Injectable({
    providedIn : 'root'
})
export class AuthService {

    constructor(private _http: HttpClient,
        private _router: Router,
      ) { }

    private authenticatedUserSubject = new BehaviorSubject<AuthResponse | null>(null);
    authenticatedUser$ = this.authenticatedUserSubject.asObservable();

    readonly PMA_APP_KEY = "PMA_APP_KEY"
    private tokenExpirationTimer: any;

    private readonly baseUrl = `${environment.apiUrl}/api/v1/auth`;


    getAuthUser(){
        return this.authenticatedUserSubject.value;
    }

    setAuthUser(user : AuthResponse | null){
      this.authenticatedUserSubject.next(user);
    }

    login(auth : any) {
        return this._http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, auth);
      }
    signup(data: any) {
      return this._http.post<ApiResponse<{ message : string }>>(`${this.baseUrl}/signup`, data);
    }

    saveAuthToLS(data: AuthResponse) {
      localStorage.setItem(this.PMA_APP_KEY, JSON.stringify(data))
    }

    loadAuthFromLS(): AuthResponse | null {
      let auth = localStorage.getItem(this.PMA_APP_KEY);
      if (auth) {
        return JSON.parse(auth);
      }
      return null;
    }

    autoLogin() {
      let auth = this.loadAuthFromLS();
      if (auth != null) {
        this.authenticatedUserSubject.next(auth);
        // this.redirectUser();
      }
    }
      
    redirectUser(){
      let route = '/auth';
      const roles = this.getAuthUser()?.roles;
      if(roles && roles.length){
        switch (roles![0].toUpperCase()) {
          case 'ADMIN':
            route = `/admin/dashboard`
            break;
          case 'ENGINEER':
            route = "/engineer/dashboard"
            break;
          case 'TEAM LEADER':
            route = `/leader/dashboard`
            break;
          case 'CLIENT':
            route = `/client/dashboard`
            break;
        }
      }
      this._router.navigate([route])      
    }

    logout() {
      this.authenticatedUserSubject.next(null);
      localStorage.removeItem(this.PMA_APP_KEY);
      this._router.navigateByUrl("/auth")
    }

    autoLogout(expirationDuration: number) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.logout();
      //   this._toast.setSuccess("Token expired, you're logged out")
      }, expirationDuration);
    }

    forgotPassword(email : string){
      return this._http.post(`${this.baseUrl}/forgot-password`, { email })
    }

    validateCode(code : string){
      return this._http.post(`${this.baseUrl}/validateCode`, { code })
    }
    
    resetPassword(data : { code : string, newPassword : string, confirmNewPassword : string }){
      return this._http.post(`${this.baseUrl}/reset-password`, data)
    }
    }