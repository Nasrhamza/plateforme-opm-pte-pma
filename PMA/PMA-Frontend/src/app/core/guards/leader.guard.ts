import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const LeaderGuard: CanActivateFn = (route, state) => {
  const _auth  =  inject(AuthService);
  const _router  =  inject(Router);
  if(_auth.getAuthUser() && _auth.getAuthUser()!.id && _auth.getAuthUser()!.roles.includes('Team Leader') ){
    return true;
  }
  _router.navigate(['/unauthorized'])
  return false;
};