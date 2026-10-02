import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { MessageService } from "../services/message.service";
import { catchError, Observable, throwError } from "rxjs";
import { inject } from "@angular/core";

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const _message = inject(MessageService);
  const _auth = inject(AuthService);
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        _auth.logout();
      }
      _message.showErrorMessage(err.error.message)
      return throwError(err);
    })
  );
}