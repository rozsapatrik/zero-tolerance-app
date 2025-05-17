import { Component, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { delay, filter } from 'rxjs/operators';
import { NavigationService } from 'src/app/core/services/navigation.service';

/**
 * Handles the navigation menu.
 */
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavigationComponent {
  /**
   * Hides the loading spinner when the navigation has ended.
   * @param router Router for routing.
   */
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private navigationService: NavigationService
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        delay(300)
      )
      .subscribe(() => {
        this.spinner.hide();
      });
  }

  /**
   * State variable for menu state.
   */
  menuState: 'closed' | 'open' | 'closing' | 'closingSoft' = 'closed';

  /**
   * Toggles the navigation menu
   */
  toggleMenu() {
    if (this.menuState === 'closed') {
      this.menuState = 'open';
    } else if (this.menuState === 'open') {
      this.menuState = 'closing';
      setTimeout(() => {
        this.menuState = 'closed';
      }, 500);
    }
  }

  /**
   * Navigates to destination after navigation menu.
   * @param path The path of the destination page.
   */
  navigateWithMenuClose(path: string) {
    this.navigationService.navigate(path, () => {
      this.menuState = 'closingSoft';
      setTimeout(() => (this.menuState = 'closed'), 500);
    });
  }
}
