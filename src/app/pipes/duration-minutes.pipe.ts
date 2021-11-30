import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationMinutes'
})
export class DurationMinutesPipe implements PipeTransform {

  transform(minutes: number): string {
    if (!minutes) {
      return '';
    } else if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      return `${Math.fround((minutes / 60))} hours`;
    }
  }

}
