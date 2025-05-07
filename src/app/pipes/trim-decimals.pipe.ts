import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe for trimming decimals for proper data display.
 */
@Pipe({
  name: 'trimDecimals'
})
export class TrimDecimalsPipe implements PipeTransform {

  /**
   * Trims decimal places off of value.
   * @param value The value to be trimmed.
   * @param decimalPlaces Amount of decimal places to be trimmer.
   * @returns Trimmed value as string.
   */
  transform(value: number, decimalPlaces: number = 2): string {
    if (!value) return '0';
    const formatted = value.toFixed(decimalPlaces); // Fixed to max decimalPlaces
    return parseFloat(formatted).toString(); // Remove unnecessary trailing zeroes
  }

}
