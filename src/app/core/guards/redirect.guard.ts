import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class RedirectGuard implements CanActivate {
  /**
   *
   * @param authService Service for user authentication.
   * @param navigationService Service for loading spinner navigation.
   */
  constructor(
    private authService: AuthenticationService,
    private navigationService: NavigationService,
    private router: Router
  ) {}

  /**
   * Redirects a UrlTree so redirecting to it works.
   * @returns Returns if no redirect happened.
   */
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isUser().pipe(
      take(1),
      map((user) => {
        if (user) {
          return this.router.createUrlTree(['/tracking/home']);
        } else {
          return this.router.createUrlTree(['/pages/landing']);
        }
      })
    );
  }
}
