import { Router } from '@angular/router';
import { RsvpService } from './../services/rsvp.service';
import { EventsService } from './../services/events.service';
import { BehaviorSubject } from 'rxjs';
import { CreateEventPage } from './../pages/create-event/create-event.page';
import { ModalController } from '@ionic/angular';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Event } from 'comeunitymodels';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  disableCreate = new BehaviorSubject<boolean>(false);
  @ViewChild('topRef') topRef: ElementRef;

  constructor(
    public modal: ModalController,
    public events: EventsService,
    public rsvps: RsvpService,
    private router: Router,
  ) {}

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
    await this.events.refreshCreatedEvents();
    await this.rsvps.refreshRsvps();
    event?.target?.complete();
  }

  async addEventClicked() {
    this.disableCreate.next(true);
    const m = await this.modal.create({
      component: CreateEventPage,
      mode: 'ios',
      swipeToClose: true,
      presentingElement: this.topRef?.nativeElement,
    });
    await m.present();
    const res = await m.onDidDismiss();
    this.disableCreate.next(false);
  }

}
