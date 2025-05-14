import { Component, ViewEncapsulation } from '@angular/core';

/**
 * Handles the navigation menu.
 */
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavigationComponent {
  /**
   * Flag to check if menu is open.
   */
  isOpen = false;

  /**
   * Toggles navigation menu.
   */
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
}
