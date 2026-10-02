import {
    HTTP_INTERCEPTORS,
    HttpEvent,
    HttpErrorResponse,
  } from "@angular/common/http";
  import { Injectable } from "@angular/core";
  import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
  } from "@angular/common/http";

  import { TokenStorageService } from "../services/token-storage.service";
  // import { AuthService } from '../_service/auth.service';

  import { BehaviorSubject, Observable, throwError } from "rxjs";
  import { catchError, filter, switchMap, take } from "rxjs/operators";

  const TOKEN_HEADER_KEY = "authorization";

  @Injectable()
  export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
      null
    );
    constructor(private tokenService: TokenStorageService) {}
    intercept(
      req: HttpRequest<any>,
      next: HttpHandler
    ): Observable<HttpEvent<Object>> {
      let authReq = req;
      const token = this.tokenService.getToken();
    //   log(token)
      if (token != null) {
        authReq = this.addTokenHeader(req, token);
      }
      return next.handle(authReq).pipe(
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            !authReq.url.includes("/signin") &&
            error.status === 401
          ) {
            return this.handle401Error(authReq, next);
          }
          return throwError(error);
        })
      );
    }
    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);
        const token = this.tokenService.getRefreshToken();
        if (token)
          return this.tokenService.refreshToken(token).pipe(
            switchMap((token: any) => {
              this.isRefreshing = false;
              this.tokenService.saveToken(token.accessToken);
              this.refreshTokenSubject.next(token.accessToken);
              return next.handle(this.addTokenHeader(request, token.accessToken));
            }),
            catchError((err) => {
              this.isRefreshing = false;
              this.tokenService.signOut();
              return throwError(err);
            })
          );
      }
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenHeader(request, token)))
      );
    }
    private addTokenHeader(request: HttpRequest<any>, token: string) {
      return request.clone({
        headers: request.headers.set(TOKEN_HEADER_KEY, "Bearer " + token),
      });
    }
  }
