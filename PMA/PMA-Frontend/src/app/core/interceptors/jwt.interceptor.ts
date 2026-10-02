import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs";
import { inject } from "@angular/core";

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const _auth = inject(AuthService);
  const token = _auth.getAuthUser()?.token;
  const clone = req.clone({
    headers: req.headers
      .set('Authorization',token ? `Bearer ${token}` : '')
  });
  return next(clone);
}