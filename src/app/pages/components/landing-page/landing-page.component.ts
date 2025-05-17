import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';

/**
 * Displays the landing page.
 */
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  /**
   *
   * @param router Router for routing.
   */
  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {}

  /**
   * Redirects to the register page.
   */
  redirectToRegister() {
    this.navigationService.navigate('/auth/register');
  }

  /**
   * Redirects to the login page.
   */
  redirectToLogin() {
    this.navigationService.navigate('/auth/login');
  }
}
