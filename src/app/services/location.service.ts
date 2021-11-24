import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  async getCoords(): Promise<[number, number]> {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return coordinates.coords ? [coordinates.coords.longitude, coordinates.coords.latitude] : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
