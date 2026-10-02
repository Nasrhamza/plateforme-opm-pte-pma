import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError(error => {
      // A token becomes invalid after expiry or a server-side secret rotation.
      // Clear the stale browser session instead of leaving every dashboard empty.
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
