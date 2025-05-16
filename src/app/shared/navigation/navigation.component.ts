import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

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
   *
   * @param router Router for routing.
   */
  constructor(private router: Router) {}

  /**
   * State variable for menu state.
   */
  menuState: 'closed' | 'open' | 'closing' = 'closed';

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
      }, 300);
    }
  }

  navigateWithMenuClose(path: String) {
    this.menuState = 'closing';

    setTimeout(() => {
      this.menuState = 'closed';
      this.router.navigate([path]);
    }, 300);
  }
}
