import { Component, ViewEncapsulation } from '@angular/core';

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
}
