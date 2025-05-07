import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Displays the landing page.
 */
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {

  /**
   * 
   * @param router Router for routing.
   */
  constructor(
    private router: Router
  ){}

  /**
   * Redirects to the register page.
   */
  redirectToRegister(){
    this.router.navigate(['/register']);
  }

  /**
   * Redirects to the login page.
   */
  redirectToLogin(){
    this.router.navigate(['/login']);
  }

}
