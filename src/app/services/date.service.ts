import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  private selectedDateSubject = new BehaviorSubject<Date>(new Date());
  selectedDate$ = this.selectedDateSubject.asObservable();

  setSelectedDate(date: Date): void {
    this.selectedDateSubject.next(date);
  }

  getSelectedDate(): Date | null {
    return this.selectedDateSubject.value;
  }
}
