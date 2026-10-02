import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs";
import { inject } from "@angular/core";

export function loggedUserInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const _auth = inject(AuthService);
  const clone = req.clone({
    headers: req.headers
      .set('current_user', _auth.getAuthUser()?.id ?? '')
  });
  return next(clone);
}