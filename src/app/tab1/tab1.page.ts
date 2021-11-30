import { LocationService } from './../services/location.service';
import { EventsService } from './../services/events.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Event } from 'comeunitymodels';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  constructor(
    public events: EventsService,
    private location: LocationService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.refresh();
  }

  eventSelected(event: Event) {
    if (event?._id) {
      this.events.selectEvent(event);
      this.router.navigateByUrl('event-details/' + event._id)
    }
  }

  async refresh(event?: any) {
    const coords = await this.location.getCoords();
    await this.events.refreshNearbyEvents(coords);
    event?.target?.complete();
  }

}
