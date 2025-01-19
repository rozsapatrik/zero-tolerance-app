import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({
  providedIn: 'root'
})
export class NotyfService {
  constructor() { }
  
  private notyf = new Notyf({
    duration: 4000, // Duration in milliseconds
    position: {
      x: 'center',
      y: 'top',
    },
    ripple: false,
    types: [
      {
        type: 'success',
        background: '#4CAF50'
      },
      {
        type: 'error',
        background: '#F44336'
      },
    ],
  });

  success(message: string): void {
    this.notyf.success(message);
  }

  error(message: string): void {
    this.notyf.error(message);
  }
}
