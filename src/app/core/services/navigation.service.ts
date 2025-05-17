import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router, private spinner: NgxSpinnerService) {}

  /**
   * Navigates with spinner, optionally delay, and a callback (e.g., to close menu)
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
