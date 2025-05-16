import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

/**
 * User guard.
 */
@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  /**
   *
   * @param authService Service for authentication.
   */
  constructor(private authService: AuthenticationService) {}

  /**
   * Returns if current user is user or not.
   * @param route Currently loaded route.
   * @param state Current state of router.
   * @returns If current user is user.
   */
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isUser();
  }
}
