import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import Swal from 'sweetalert2';



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authServ: AuthService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.authServ.logout();
        }
        Swal.fire('Failure', err.error.message ||'Failure', 'error');
        return throwError(err);
      })
    );
  }
}