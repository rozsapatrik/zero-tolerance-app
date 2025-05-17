import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  /**
   *
   * @param router Router for routing.
   * @param spinner Loading spinner service.
   */
  constructor(private router: Router, private spinner: NgxSpinnerService) {}

  /**
   * Navigates to the desired path smoothly.
   * @param path The destination path.
   * @param beforeNavigate Optional method to be ran before navigation.
   * @param delay Delay time in ms.
   * @param spinnerHideDelay Delay time in ms for the spinner.
   */
  navigate(
    path: string,
    beforeNavigate?: () => void,
    delay: number = 300,
    spinnerHideDelay: number = 200
  ) {
    this.spinner.show();

    if (beforeNavigate) {
      beforeNavigate();
    }

    setTimeout(() => {
      this.router.navigate([path]).finally(() => {
        setTimeout(() => this.spinner.hide(), spinnerHideDelay);
      });
    }, delay);
  }
}
