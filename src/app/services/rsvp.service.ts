import { RxJsUtils } from './../../utils/Utils';
import { SessionService } from './session.service';
import { HttpService } from './http.service';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Rsvp, Event, RsvpDTO, RsvpNotificationPreferences, DeviceStats } from 'comeunitymodels';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { PushNotificationService } from './push-notification.service';

@Injectable({
  providedIn: 'root'
})
export class RsvpService {
  rsvps = new BehaviorSubject<Rsvp[]>([]);
  rsvpdEvents: Observable<Event[]> = this.rsvps.pipe(
    distinctUntilChanged((x, y) => _.isEqual(x, y)),
    switchMap((rsvps) => {
      if (!rsvps || !rsvps.length) {
        return of([]);
      } else {
        return this.getEventsByIds(rsvps.map((r) => r.eventId));
      }
    })
  )

  constructor(
    private http: HttpService,
    private session: SessionService,
    private notifications: PushNotificationService,
  ) { }

  async refreshRsvps(): Promise<void> {
    const user = await RxJsUtils.getPromiseVal(this.session.user$);
    if (user) {
      const { success, rsvps } = await this.http.get<{ success: boolean, rsvps?: Rsvp[] }>('api/rsvps/' + user._id);
      this.rsvps.next(rsvps);
    } else {
      this.rsvps.next([]);
    }
  }

  async updateRsvpNotificationPreferences(rsvpId: string, preferences: Partial<Omit<RsvpNotificationPreferences, keyof DeviceStats>>): Promise<{success: boolean, rsvp?: Rsvp}> {
    const res = await this.http.put<{success: boolean, rsvp?: Rsvp}>(`api/rsvp/${rsvpId}/notifications`, preferences);
    if (res.success && res.rsvp) {
      const allRsvps = this.rsvps.value;
      const index = allRsvps.findIndex((r) => r._id === rsvpId);
      if (index > -1) {
        allRsvps[index] = res.rsvp;
      }
      this.rsvps.next([...allRsvps]);
    }
    return res;
  }

  async rsvpToEvent(eventId: string): Promise<{ success: boolean, rsvp?: Rsvp }> {
    const user = await RxJsUtils.getPromiseVal(this.session.user$);
    if (!user) { return { success: false }; }
    try {
      const dto: Omit<RsvpDTO, 'createdAt' | '_id'> = {
        eventId,
        userId: user._id,
        preferences: {
          ...user.device,
          notifyOnAnnouncement: this.notifications.isDenied ? false : true,
          notifyOnComment: this.notifications.isDenied ? false : true,
          notifyOnUpdates: this.notifications.isDenied ? false : true,
        },
      };
      const res = await this.http.post<{ success: boolean, rsvp?: Rsvp }>('api/rsvp', dto);
      if (res.success && res.rsvp) {
        this.rsvps.next([...this.rsvps.value, res.rsvp]);
      }
      return res;
    } catch (e) {
      return { success: false };
    }
  }


  private getEventsByIds(eventIds: string[]): Observable<Event[]> {
    return new Observable((observer) => {
      Promise.all(
        eventIds.map((id) => this.http.get<{ success: boolean, event?: Event }>('api/events/' + id))
      ).then((results) => {
        const events = results.filter((res) => res.success).map((res) => res.event);
        observer.next(events);
        observer.complete();
      }, (err) => observer.error(err));
    });
  }

}
