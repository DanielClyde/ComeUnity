import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {

  transform(meters: number, inMiles = false): string {
    if (inMiles) {
      return (meters * .000621371).toFixed(1) + ' miles away';
    } else {
      return meters < 1000 ? meters + ' meters away' : (meters / 1000).toFixed(1) + ' kilometers away';
    }
  }

}
