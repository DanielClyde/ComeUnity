import { distinctUntilChanged } from 'rxjs/operators';
import { TagChip } from './../pages/create-event/tag-select/tag-select.component';
import { HttpService } from './http.service';
import { RxJsUtils } from './../../utils/Utils';
import { SessionService } from './session.service';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Event, EventDTO, } from 'comeunitymodels';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  availableTags = new BehaviorSubject<TagChip[]>([]);
  selectedTags = new BehaviorSubject<TagChip[]>([]);

  currentEvent = new BehaviorSubject<Event>(null);

  nearbyEvents = new BehaviorSubject<Event[]>([]);
  userCreatedEvents = new BehaviorSubject<Event[]>([]);

  constructor(
    private session: SessionService,
    private http: HttpService,
  ) { }

  async selectEvent(event?: Event | string) {
    if (event && (typeof event === 'string')) {
      const res = await this.http.get<{success: Boolean, event?: Event}>('api/events/' + event);
      this.currentEvent.next(res.event);
    } else {
      this.currentEvent.next(event as Event);
    }
  }

  selectTag(tag: TagChip) {
    this.availableTags.next([
      ...this.availableTags.value.filter((t) => t.label !== tag.label),
    ]);
    this.selectedTags.next([
      ...this.selectedTags.value,
      tag,
    ]);
  }

  deselectTag(tag: TagChip) {
    this.selectedTags.next([
      ...this.selectedTags.value.filter((t) => t.label !== tag.label),
    ]);
    if (!tag.isCustom) {
      this.availableTags.next([
        ...this.availableTags.value,
        tag,
      ]);
    }
  }

  async refreshNearbyEvents(coords: [number, number]) {
    console.log('refreshing nearby events', coords);
    const { success, events } =
      await this.http.get<{ success: boolean, events?: Event[] }>(
        `api/events/nearby?long=${coords[0]}&lat=${coords[1]}`);
    this.nearbyEvents.next(events ? events : []);
  }

  async refreshCreatedEvents() {
    const user = await RxJsUtils.getPromiseVal(this.session.user$);
    if (!user) { return; }
    const { success, events } = await this.http.get<{ success: boolean, events?: Event[] }>('api/events/created/' + user._id);
    this.userCreatedEvents.next(events);
  }

  async postEvent(eventDTO: Omit<EventDTO, 'createdAt' | '_id'>): Promise<{ success: boolean, event?: Event }> {
    try {
      const res = await this.http.post<{ success: boolean, event?: Event }>('api/events', eventDTO);
      return res;
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }
}
