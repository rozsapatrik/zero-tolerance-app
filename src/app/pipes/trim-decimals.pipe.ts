import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimDecimals'
})
export class TrimDecimalsPipe implements PipeTransform {

  transform(value: number, decimalPlaces: number = 2): string {
    if (!value) return '0';
    const formatted = value.toFixed(decimalPlaces); // Fixed to max decimalPlaces
    return parseFloat(formatted).toString(); // Remove unnecessary trailing zeroes
  }

}
