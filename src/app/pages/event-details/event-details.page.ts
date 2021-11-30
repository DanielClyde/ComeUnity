import { ToastService } from './../../services/toast.service';
import { Haptics } from '@capacitor/haptics';
import { RsvpService } from './../../services/rsvp.service';
import { EventsService } from './../../services/events.service';
import { takeUntil, map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, Observable } from 'rxjs';
import { Rsvp, Address } from 'comeunitymodels';
import { PushNotificationService } from 'src/app/services/push-notification.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit, OnDestroy {
  public rsvpForCurrentEvent: Observable<Rsvp> = combineLatest([
    this.events.currentEvent,
    this.rsvps.rsvps,
  ]).pipe(
    map(([currentEvent, rsvps]) => {
      if (!currentEvent || !rsvps?.length) {
        return null;
      } else {
        return rsvps.find((r) => r.eventId === currentEvent._id);
      }
    }),
  );

  public isCreator: Observable<boolean> = combineLatest([
    this.events.currentEvent,
    this.events.userCreatedEvents,
  ]).pipe(
    map(([currentEvent, createdEvents]) => {
      if (!currentEvent || !createdEvents?.length) {
        return false;
      } else {
        return !!(createdEvents.find((e) => e._id === currentEvent._id));
      }
    }),
  );

  private onDestroy = new Subject();

  constructor(
    public events: EventsService,
    public rsvps: RsvpService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private notifications: PushNotificationService,
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.onDestroy),
      map((params) => params?.eventId),
    ).subscribe((eventId) => {
      if (!this.events.currentEvent.value) {
        this.events.selectEvent(eventId);
      }
    });

    if (!this.rsvps.rsvps.value?.length) {
      this.rsvps.refreshRsvps();
    }
    if (!this.events.userCreatedEvents.value?.length) {
      this.events.refreshCreatedEvents();
    }
  }

  ngOnDestroy() {
    this.events.selectEvent(null);
    this.onDestroy.next();
  }

  openMap(address: Address) {
    window.open('https://www.google.com/maps?saddr=My+Location&daddr=' + address.description, '_blank')
  }

  edit() {
    console.log('edit clicked!');
  }

  async rsvpForEvent(eventId: string) {
    await Haptics.impact();
    const { success, rsvp } = await this.rsvps.rsvpToEvent(eventId)
    if (success) {
      this.toast.showToast('Successfully RSVP\'d to event!');
      this.events.selectEvent(eventId);
    } else {
      this.toast.showToast('Failed to RSVP to event', 2000, 'danger');
    }
  }

  async toggleNotifyOnComments(r: Rsvp) {
    if (r) {
      const notifyOnComment = !(r.preferences?.notifyOnComment);
      if (notifyOnComment && this.notifications.isDenied) {
        await this.notifications.register();
      }
      const {success, rsvp} = await this.rsvps.updateRsvpNotificationPreferences(r._id, {
        notifyOnComment,
      });
      if (success) {
        this.toast.showToast('Updated notification preferences!', 1000);
      } else {
        this.toast.showToast('Failed to update notification preferences.', 1000, 'danger');
      }
    }
  }

  async toggleNotifyOnAnnouncements(r: Rsvp) {
    if (r) {
      const notifyOnAnnouncement = !(r.preferences?.notifyOnAnnouncement);
      if (notifyOnAnnouncement && this.notifications.isDenied) {
        await this.notifications.register();
      }
      const {success, rsvp} = await this.rsvps.updateRsvpNotificationPreferences(r._id, {
        notifyOnAnnouncement: !(r.preferences?.notifyOnAnnouncement),
      });
      if (success) {
        this.toast.showToast('Updated notification preferences!', 1000);
      } else {
        this.toast.showToast('Failed to update notification preferences.', 1000, 'danger');
      }
    }
  }

  async toggleNotifyOnUpdates(r: Rsvp) {
    if (r) {
      const notifyOnUpdates = !(r.preferences?.notifyOnUpdates);
      if (notifyOnUpdates && this.notifications.isDenied) {
        await this.notifications.register();
      }
      const {success, rsvp} = await this.rsvps.updateRsvpNotificationPreferences(r._id, {
        notifyOnUpdates: !(r.preferences?.notifyOnUpdates),
      });
      if (success) {
        this.toast.showToast('Updated notification preferences!', 1000);
      } else {
        this.toast.showToast('Failed to update notification preferences.', 1000, 'danger');
      }
    }
  }
}
