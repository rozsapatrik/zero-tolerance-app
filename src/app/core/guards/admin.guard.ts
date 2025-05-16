import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

/**
 * Admin guard.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  /**
   *
   * @param authService Service for user authentication.
   */
  constructor(private authService: AuthenticationService) {}

  /**
   * Returns if current user is admin or not.
   * @param route Currently loaded route.
   * @param state Current state of router.
   * @returns If current user is admin.
   */
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isAdmin();
  }
}
