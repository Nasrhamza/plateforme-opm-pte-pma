import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommercialGuard implements CanActivate {

  constructor(private router: Router ,private authService : AuthService) { }
  canActivate() {
  return this.authService.authenticatedUser$.pipe(
    switchMap(user =>{
      if (user.user.authority != 'commercial'&& user.user.authority!='admin' ){
        this.router.navigate(["/unauthorized"])
        return of(false)
      }
      return of(true)
    })
  )
  }
}
