import { timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { first, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  async getCoords(): Promise<[number, number]> {
    try {
      const coordinates = await Promise.race([timer(5000).pipe(first(), mapTo(null)).toPromise(), Geolocation.getCurrentPosition()]);
      return coordinates?.coords ? [coordinates.coords.longitude, coordinates.coords.latitude] : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
