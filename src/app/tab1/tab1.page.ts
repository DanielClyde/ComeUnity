import { LocationService } from './../services/location.service';
import { EventsService } from './../services/events.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  constructor(
    public events: EventsService,
    private location: LocationService,
  ) { }

  ngOnInit() {
    this.refresh();
  }

  async refresh(event?: any) {
    const coords = await this.location.getCoords();
    await this.events.refreshNearbyEvents(coords);
    event?.target?.complete();
  }

}
