import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import Observer from "./observer";
import { environment } from "../../environments/environment";

const TOKEN_KEY = "auth-token";
const REFRESHTOKEN_KEY = "auth-refreshtoken";
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor(
    private httpClient: HttpClient,
    private router: Router,
  ) {}
  AUTH_API = "http://localhost:3000/";

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  signOut(cb?): void {
    const refreshToken = this.getRefreshToken();
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      body: {
        requestToken: refreshToken,
      },
    };
    const point = environment.apiUrl + "/users/signout";
    this.httpClient.delete(point, options).subscribe(
      new Observer(
        null, 
        null,
        true,
        true,
        null,
        null
      ).OBSERVER_DELETE((res, signOut: boolean) => {
        if (cb) cb(signOut);
        localStorage.clear();
        this.router.navigate(["/"]);
      })
    );
  }

  public saveToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveRefreshToken(token: string): void {
    localStorage.removeItem(REFRESHTOKEN_KEY);
    localStorage.setItem(REFRESHTOKEN_KEY, token);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESHTOKEN_KEY);
  }

  public getUser(): any {
    const token = localStorage.getItem(TOKEN_KEY);
    const decoded = jwtDecode(token);
    if (decoded) {
      return decoded;
    }
    return {};
  }
  refreshToken(token: string) {
    return this.httpClient.post(
      this.AUTH_API + "refreshtoken",
      {
        requestToken: token,
      },
      this.httpOptions
    );
  }
}