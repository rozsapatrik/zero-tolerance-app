import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

/**
 * Service for displaying messages.
 */
@Injectable({
  providedIn: 'root'
})
export class NotyfService {
  constructor() { }
  
  /**
   * Notyf object.
   */
  private notyf = new Notyf({
    duration: 4000,
    position: {
      x: 'center',
      y: 'top',
    },
    ripple: false,
    types: [
      {
        type: 'success',
        background: '#4CAF50',
        dismissible: true
      },
      {
        type: 'error',
        background: '#F44336',
        dismissible: true
      },
    ],
  });

  /**
   * Sets the type of the message to success.
   * @param message The message to be displayed.
   */
  success(message: string): void {
    this.notyf.success(message);
  }

  /**
   * Sets the type of the message to error.
   * @param message The message to be displayed.
   */
  error(message: string): void {
    this.notyf.error(message);
  }
}
