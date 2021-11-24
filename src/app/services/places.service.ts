import { Observable, of } from 'rxjs';
import { map, withLatestFrom, switchMap } from 'rxjs/operators';
import { SessionService } from './session.service';
import { Injectable } from '@angular/core';
import { Range } from 'comeunitymodels';

declare var google;

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private autocompleteService;
  private geocoder;
  radius: Observable<Range> = this.session.user$.pipe(
    map((u) => u?.preferences?.distanceRange || Range.FIFTY),
  )

  constructor(
    private session: SessionService,
  ) {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
  }

  search(text: string): Observable<any[]> {
    return of(text).pipe(
      withLatestFrom(this.radius),
      switchMap(([input, radius]) => this.placesSearch({ input }))
    )
  }

  private placesSearch(request: { input: string, location?: any, radius?: any }): Observable<any[]> {
    return new Observable((observer) => {
      try {
        this.autocompleteService.getPlacePredictions(request, (results, status) => {
          observer.next(results);
          observer.complete();
        });
      } catch (e) {
        observer.error(e);
      }
    });
  }

  geocode(placeId: string): Observable<[number, number]> {
    return new Observable((observer) => {
      try {
        this.geocoder.geocode({ placeId }, (places, status) => {
          observer.next([places[0]?.geometry?.location?.lng(), places[0]?.geometry?.location?.lat()]);
          observer.complete();
        })
      } catch (e) {
        observer.error(e);
      }
    })
  }
}
