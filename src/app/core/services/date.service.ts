import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for date selector.
 */
@Injectable({
  providedIn: 'root',
})
export class DateService {
  /**
   * Date that always holds the latest value and emits that instantly to subscribers.
   */
  private selectedDateSubject = new BehaviorSubject<Date>(new Date());
  /**
   * Date as observable.
   */
  selectedDate$ = this.selectedDateSubject.asObservable();

  /**
   * Sets the selected date.
   * @param date The selected date.
   */
  setSelectedDate(date: Date): void {
    this.selectedDateSubject.next(date);
  }

  /**
   * Gets the selected date.
   * @returns The set date.
   */
  getSelectedDate(): Date | null {
    return this.selectedDateSubject.value;
  }
}
